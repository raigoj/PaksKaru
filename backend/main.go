package main

import (
  "fmt"
  "net/http"
  "log"
)

func main() {
  http.HandleFunc("/", mainHandler)
  log.Fatal(http.ListenAndServe(":8080", nil))
}

func mainHandler(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintf(w, "hello junction %s", r.URL.Path[1:])
}
