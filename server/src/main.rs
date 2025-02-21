mod middleware;
mod api;
mod entities;
mod domain;
mod utils;
mod prover;
mod schema;
mod services;
use anyhow::Result;
use api::handlers::auth::AppState;
use diesel::MysqlConnection;
use diesel::Connection;
use entities::account_repo::AccountRepo;
use entities::account::{Account};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::spawn;
use dotenv::dotenv;
use std::env;

pub static SERVICE_ID: &str = "weave_service";

fn establish_connection() -> MysqlConnection {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    MysqlConnection::establish(&database_url).expect("Error connecting to database")
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let conn = establish_connection();
    let repo = AccountRepo::new(conn);

    std::env::set_var(
            "RUST_LOG",
            "DEBUG,ctclient::internal=off,reqwest=off,hyper=off,tracing=off,sp1_stark=info,jmt=off,p3_dft=off,p3_fri=off,sp1_core_executor=info,sp1_recursion_program=info,p3_merkle_tree=off,sp1_recursion_compiler=off,sp1_core_machine=off",
        );
    pretty_env_logger::init();

    let prover = prover::create_prover_server();
    let prover_clone = prover.clone();
    let state = AppState{
        prover: prover_clone,
        account_repo: repo,
    };
    

    tokio::select! {
        _ = spawn(async move {
            if let Err(e) = prover::start_prover_server(prover).await {
                log::error!("Error occurred while running prover: {:?}", e);
            }
        }) => {
            println!("Prover runner task completed");
        }
        _ = spawn(async move {
            if let Err(e) = api::server::start_server(state).await {
                log::error!("Error occurred while running API server: {:?}", e);
            }
        }) => {
            println!("API server task completed");
        }
    }

    Ok(())
}
