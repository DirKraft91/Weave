use axum::{
    http::StatusCode,
    Json,
};
use diesel::MysqlConnection;
use diesel::Connection;
use serde_json::{json, Value};
use std::env;

/// Checks the server and database status
pub async fn health_check() -> (StatusCode, Json<Value>) {
    let db_status = check_database_connection();

    let status = if db_status {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };

    (status, Json(json!({
        "status": if status == StatusCode::OK { "healthy" } else { "unhealthy" },
        "database": db_status,
        "timestamp": chrono::Utc::now().to_rfc3339(),
    })))
}

/// Checks the database connection
fn check_database_connection() -> bool {
    let database_url = match env::var("DATABASE_URL") {
        Ok(url) => url,
        Err(_) => return false,
    };

    match MysqlConnection::establish(&database_url) {
        Ok(_) => true,
        Err(_) => false,
    }
}
