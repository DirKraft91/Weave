mod operations;
mod proof;
mod services;
mod handlers;
mod middleware;
mod config;
mod constants;

use anyhow::Result;
use tokio::spawn;
use crate::handlers::router::ApiService;
use crate::services::node::NodeService;
use dotenv::dotenv;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();

    std::env::set_var(
            "RUST_LOG",
            "DEBUG,ctclient::internal=off,reqwest=off,hyper=off,tracing=off,sp1_stark=info,jmt=off,p3_dft=off,p3_fri=off,sp1_core_executor=info,sp1_recursion_program=info,p3_merkle_tree=off,sp1_recursion_compiler=off,sp1_core_machine=off",
        );
    pretty_env_logger::init();

    let node_service = NodeService::new();
    let api_service = ApiService::new(&node_service.prover);

    tokio::select! {
        _ = spawn(async move {
            if let Err(e) = node_service.run_prover().await {
                log::error!("Error occurred while running prover: {:?}", e);
            }
        }) => {
            println!("Prover runner task completed");
        }
        _ = spawn(async move {
            if let Err(e) = api_service.start_server().await {
                log::error!("Error occurred while running API server: {:?}", e);
            }
        }) => {
            println!("API server task completed");
        }
    }

    Ok(())
}
