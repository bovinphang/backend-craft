package main

import (
 "net/http"
 "sync/atomic"
 "github.com/gin-gonic/gin"
)

type CreateOrder struct { Name string `json:"name" binding:"required,min=1,max=80"` }

func newRouter(writes *atomic.Int32, defective bool) *gin.Engine {
 router := gin.New()
 router.POST("/orders", func(c *gin.Context) {
  c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1024)
  var input CreateOrder
  if err := c.ShouldBindJSON(&input); err != nil {
   c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error":"invalid order"})
   // Abort stops the chain, so this handler must also return explicitly.
   if !defective { return }
  }
  writes.Add(1)
  c.JSON(http.StatusCreated, gin.H{"created":true})
 })
 return router
}
func main() { if err := newRouter(&atomic.Int32{}, false).Run("127.0.0.1:3000"); err != nil { panic(err) } }
