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
  c := gogpt.NewClient("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")
  ctx := context.Background()
  var v map[string][]string

  err := json.NewDecoder(r.Body).Decode(&v)

  if err != nil {
    return
  }
  var prompt = `Topic: Britain, coronavirus, beaches
  Headline: Videos show crowded beaches in Britain

  Topic: Apple, Big Sur, software
  Headline: Apple promises faster software update installation with macOS Big Sur

  Topic: Artic, climate change, satellite
  Headline: A Satellite Lets Scientists See Antarctica’s Melting Like Never Before

  Topic: {example}
  Headline:`

  var keywords  = v["keywords"]
  fmt.Println(keywords)
  var b = strings.Join(keywords, ", ")
	req := gogpt.CompletionRequest{
		Model: "text-davinci-002",
		MaxTokens: 30,
		Prompt:    strings.ReplaceAll(prompt, "{example}", b),
	}
	resp, err := c.CreateCompletion(ctx, req)
	if err != nil {
		return
	}
	fmt.Println(1, resp.Choices[0].Text)

  var d []string
  //fmt.Printf("%+v", searchResp)
  // fmt.Fprintf(w, searchResp.SearchResults[0].Text, r)
  for _, v := range resp.Choices {
    d = append(d, v.Text)
  }

  type Man struct {
    Sentence string
  }

  var x Man
  x.Sentence = d[0]
  sentence, err := json.Marshal(x)
  if err != nil {
    fmt.Println("ERROR 2", err)
  }
  w.Write(sentence)
}

func Middleware(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authentication")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		fn.ServeHTTP(w, r)
	}
}
