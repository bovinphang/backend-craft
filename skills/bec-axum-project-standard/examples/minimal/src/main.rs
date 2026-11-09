use std::sync::{Arc, atomic::AtomicUsize};
#[tokio::main]
async fn main() {
 let listener=tokio::net::TcpListener::bind("127.0.0.1:3000").await.expect("listen failed");
 axum::serve(listener,craft_axum_contract::router(Arc::new(AtomicUsize::new(0)),false))
  .with_graceful_shutdown(async {tokio::signal::ctrl_c().await.expect("signal failed");}).await.expect("server failed");
}
