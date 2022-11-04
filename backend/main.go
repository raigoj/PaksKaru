package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
  "strings"

	gogpt "github.com/sashabaranov/go-gpt3"
)

func main() {
  http.HandleFunc("/", Middleware(mainHandler))
  log.Fatal(http.ListenAndServe(":8080", nil))
}

func mainHandler(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintf(w, "hello junction %s", r.URL.Path[1:])
  c := gogpt.NewClient("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")
  ctx := context.Background()
  var v map[string][]string

  err := json.NewDecoder(r.Body).Decode(&v)

  if err != nil {
    fmt.Println("ERROR", err)
    w.WriteHeader(http.StatusInternalServerError)
    return
  }

  var keywords  = v["keywords"]
  fmt.Println(keywords)
  var b = strings.Join(keywords, ", ")
  fmt.Println(911, b)
	req := gogpt.CompletionRequest{
		Model: "davinci",
		MaxTokens: 30,
		Prompt:    b,
	}
	resp, err := c.CreateCompletion(ctx, req)
	if err != nil {
		return
	}
	fmt.Println(1, resp.Choices[0].Text)

  //fmt.Printf("%+v", searchResp)
  // fmt.Fprintf(w, searchResp.SearchResults[0].Text, r)
  for _, v := range resp.Choices {
    fmt.Println(011100, v.Text)
  }
  fmt.Fprintf(w, resp.Choices[0].Text)
}

func Middleware(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authentication")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		fn.ServeHTTP(w, r)
	}
}
