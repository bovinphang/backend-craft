package main

import (
 "net/http"
 "net/http/httptest"
 "os"
 "strings"
 "sync/atomic"
 "testing"
 "github.com/gin-gonic/gin"
)

func TestInvalidInput(t *testing.T) {
 gin.SetMode(gin.TestMode)
 var writes atomic.Int32
 router:=newRouter(&writes,os.Getenv("CRAFT_EXAMPLE_DEFECTIVE")=="1")
 for _,body:=range []string{`{"name":""}`,`{broken`} {
  recorder:=httptest.NewRecorder();request:=httptest.NewRequest(http.MethodPost,"/orders",strings.NewReader(body));request.Header.Set("Content-Type","application/json")
  router.ServeHTTP(recorder,request)
  if recorder.Code!=http.StatusBadRequest {t.Errorf("expected 400, got %d",recorder.Code)}
 }
 if writes.Load()!=0 {t.Fatalf("rejected input caused %d side effects",writes.Load())}
}
func TestValidInput(t *testing.T) {
 gin.SetMode(gin.TestMode);var writes atomic.Int32
 recorder:=httptest.NewRecorder();request:=httptest.NewRequest(http.MethodPost,"/orders",strings.NewReader(`{"name":"one"}`));request.Header.Set("Content-Type","application/json")
 newRouter(&writes,false).ServeHTTP(recorder,request)
 if recorder.Code!=http.StatusCreated||writes.Load()!=1 {t.Fatal("valid request must have one effect and 201")}
}
