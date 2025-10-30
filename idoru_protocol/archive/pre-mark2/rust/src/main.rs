use clap::Parser;
use std::sync::Arc;
use anyhow::Result;
use idoru_protocol::core::agent::{Agent, AgentRole};
use idoru_protocol::protocol::swarm::Swarm;
use idoru_protocol::network::app::IdoruApp;

#[derive(Parser)]
#[command(version = "0.1.0", about = "Idoru Protocol MVP - Off-chain HPC")]
struct Cli {
    #[arg(long, default_value_t = 5)]
    agent_count: usize,
    #[arg(long, default_value = "http://127.0.0.1:8080")]
    resonance_api: String,
    #[arg(long, default_value_t = 3)]
    iterations: u32,
    #[arg(long, default_value_t = false)]
    gui: bool,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    // Create the swarm
    let swarm = Arc::new(Swarm::new(cli.resonance_api.clone()));

    // Add agents with different roles
    for i in 0..cli.agent_count {
        let role = if i % 2 == 0 {
            AgentRole::Explorer
        } else {
            AgentRole::WarGamer
        };
        swarm.add_agent(&format!("agent_{}", i), role).await;
    }

    if cli.gui {
        // Run with GUI
        let app = IdoruApp::new(swarm.clone());
        let options = eframe::NativeOptions::default();
        eframe::run_native("Idoru Protocol - Resonance Demo", options, Box::new(|_| Box::new(app)))?;
    } else {
        // Run without GUI
        println!("Starting HPC concurrency for {} agents...", cli.agent_count);

        for round in 0..cli.iterations {
            // Run HPC tasks
            swarm.run_hpc_tasks().await?;
            println!("Round {} done. Agents updated on chain.", round);
        }
    }

    Ok(())
} 