use std::sync::Arc;
use tokio::sync::Mutex;
use anyhow::Result;
use crate::core::agent::{Agent, AgentRole};

pub struct Swarm {
    agents: Arc<Mutex<Vec<Agent>>>,
    bridge_path: String,
}

impl Swarm {
    pub fn new(bridge_path: String) -> Self {
        Self {
            agents: Arc::new(Mutex::new(Vec::new())),
            bridge_path,
        }
    }

    pub async fn add_agent(&self, id: &str, role: AgentRole) {
        let mut agents = self.agents.lock().await;
        agents.push(Agent::new(id, role));
    }

    pub async fn run_hpc_tasks(&self) -> Result<()> {
        let agents = self.agents.lock().await;
        let mut tasks = vec![];
        
        // Spawn a task for each agent
        for agent_idx in 0..agents.len() {
            let mut agent_ref = agents[agent_idx].clone();
            tasks.push(tokio::spawn(async move {
                agent_ref.run_simulation();
                agent_ref
            }));
        }

        // Wait for all tasks to complete
        let updated = futures::future::join_all(tasks).await;
        
        // Update the agents with the results
        let mut agents = self.agents.lock().await;
        for (i, res) in updated.into_iter().enumerate() {
            if let Ok(new_agent) = res {
                agents[i] = new_agent;
            }
        }

        // Bridge the results to the on-chain state
        self.bridge_results().await?;

        Ok(())
    }

    async fn bridge_results(&self) -> Result<()> {
        let agents = self.agents.lock().await;
        
        for agent in agents.iter() {
            // Call the bridging function to update on-chain state
            submit_resonance_update(&self.bridge_path, &agent.id, agent.resonance).await?;
        }
        
        Ok(())
    }
}

async fn submit_resonance_update(bridge_path: &str, agent_id: &str, resonance: f64) -> Result<()> {
    // For MVP, we'll use a simple HTTP endpoint
    // In a production environment, this could be gRPC or Zero-Copy
    let endpoint = format!("{}/update_resonance", bridge_path);
    let body = serde_json::json!({
        "agent_id": agent_id,
        "value": (resonance as u64),
    });

    let client = reqwest::Client::new();
    let resp = client.post(endpoint)
        .json(&body)
        .send()
        .await?;

    if !resp.status().is_success() {
        eprintln!("Failed to update resonance for {} - status {}", agent_id, resp.status());
    }

    Ok(())
} 