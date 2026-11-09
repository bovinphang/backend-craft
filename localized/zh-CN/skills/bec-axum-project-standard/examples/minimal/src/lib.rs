use axum::{extract::{State, DefaultBodyLimit, rejection::JsonRejection}, http::StatusCode, response::{IntoResponse, Response}, routing::post, Json, Router};
use serde::Deserialize;
use std::sync::{Arc, atomic::{AtomicUsize, Ordering}};

#[derive(Clone)]
struct AppState { writes: Arc<AtomicUsize>, defective: bool }
#[derive(Deserialize)]
struct CreateOrder { name: String }

async fn create(State(state): State<AppState>, payload: Result<Json<CreateOrder>, JsonRejection>) -> Response {
 match payload {
  Ok(Json(order)) => {
   if order.name.is_empty()||order.name.len()>80 { return StatusCode::UNPROCESSABLE_ENTITY.into_response(); }
   state.writes.fetch_add(1,Ordering::SeqCst);
   StatusCode::CREATED.into_response()
  }
  Err(rejection) => {
   if state.defective {
    state.writes.fetch_add(1,Ordering::SeqCst);
    StatusCode::OK.into_response()
   } else {
    rejection.into_response()
   }
  }
 }
}
pub fn router(writes: Arc<AtomicUsize>, defective: bool) -> Router {
 Router::new().route("/orders",post(create)).layer(DefaultBodyLimit::max(1024)).with_state(AppState{writes,defective})
}

#[cfg(test)]
mod tests {
 use super::*;use axum::{body::Body,http::Request};use tower::ServiceExt;
 #[tokio::test] async fn rejects_invalid_json() {
  let writes=Arc::new(AtomicUsize::new(0));
  let response=router(writes.clone(),cfg!(feature="defective")).oneshot(Request::post("/orders").header("content-type","application/json").body(Body::from("{broken")).unwrap()).await.unwrap();
  assert!(response.status().is_client_error(),"extractor rejection must stay 4xx");
  assert_eq!(writes.load(Ordering::SeqCst),0,"rejected body must have no side effects");
 }
 #[tokio::test] async fn valid_input_has_one_effect() {
  let writes=Arc::new(AtomicUsize::new(0));
  let response=router(writes.clone(),false).oneshot(Request::post("/orders").header("content-type","application/json").body(Body::from(r#"{"name":"one"}"#)).unwrap()).await.unwrap();
  assert_eq!(response.status(),StatusCode::CREATED);assert_eq!(writes.load(Ordering::SeqCst),1);
 }
}
