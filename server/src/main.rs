mod middleware;
mod api;
mod domain;
mod utils;
mod prover;
mod services;
use anyhow::Result;
use tokio::spawn;
use dotenv::dotenv;

pub static SERVICE_ID: &str = "weave_service";

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();

    std::env::set_var(
            "RUST_LOG",
            "DEBUG,ctclient::internal=off,reqwest=off,hyper=off,tracing=off,sp1_stark=info,jmt=off,p3_dft=off,p3_fri=off,sp1_core_executor=info,sp1_recursion_program=info,p3_merkle_tree=off,sp1_recursion_compiler=off,sp1_core_machine=off",
        );
    pretty_env_logger::init();

    let prover = prover::create_prover_server();
    let prover_clone = prover.clone();
    

    tokio::select! {
        _ = spawn(async move {
            if let Err(e) = prover::start_prover_server(prover).await {
                log::error!("Error occurred while running prover: {:?}", e);
            }
        }) => {
            println!("Prover runner task completed");
        }
        _ = spawn(async move {
            if let Err(e) = api::server::start_server(prover_clone).await {
                log::error!("Error occurred while running API server: {:?}", e);
            }
        }) => {
            println!("API server task completed");
        }
    }

    Ok(())
}
