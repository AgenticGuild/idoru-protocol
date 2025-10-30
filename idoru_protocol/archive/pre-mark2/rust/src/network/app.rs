use eframe::egui;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::core::agent::Agent;
use crate::protocol::swarm::Swarm;

pub struct IdoruApp {
    swarm: Arc<Swarm>,
    agents: Arc<Mutex<Vec<Agent>>>,
}

impl IdoruApp {
    pub fn new(swarm: Arc<Swarm>) -> Self {
        Self {
            swarm: swarm.clone(),
            agents: Arc::new(Mutex::new(Vec::new())),
        }
    }
}

impl eframe::App for IdoruApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Idoru Protocol - Agent Resonance");
            
            // Button to run HPC step
            if ui.button("Run HPC Step").clicked() {
                let swarm = self.swarm.clone();
                tokio::spawn(async move {
                    if let Err(e) = swarm.run_hpc_tasks().await {
                        eprintln!("Error running HPC tasks: {}", e);
                    }
                });
            }
            
            ui.separator();
            
            // Display agent information
            ui.heading("Agents");
            
            // This is a simplified version - in a real app, you'd need to handle async state updates
            let agents = self.agents.blocking_lock();
            for agent in agents.iter() {
                ui.horizontal(|ui| {
                    ui.label(format!("ID: {}", agent.id));
                    ui.label(format!("Role: {:?}", agent.role));
                    ui.label(format!("Resonance: {:.2}", agent.resonance));
                });
            }
        });
        
        // Request continuous repainting for real-time updates
        ctx.request_repaint();
    }
} 