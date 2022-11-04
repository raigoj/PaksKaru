package main

import (
  "fmt"
  "net/http"
  "log"
  gogpt "github.com/sashabaranov/go-gpt3"
  "context"
)

func main() {
  http.HandleFunc("/", mainHandler)
  log.Fatal(http.ListenAndServe(":8080", nil))
}

func mainHandler(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintf(w, "hello junction %s", r.URL.Path[1:])
	c := gogpt.NewClient("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")
	ctx := context.Background()
//  example := "Chicago, restaurants, summer"
//	req := gogpt.CompletionRequest{
//		Model: "davinci",
//		MaxTokens: 30,
//		Prompt:    example,
//	}
//	resp, err := c.CreateCompletion(ctx, req)
//	if err != nil {
//		return
//	}
//	fmt.Println(1, resp.Choices[0].Text)
//  var v map[string]interface{}

// err := json.NewDecoder(r.Body).Decode(&v)

//  if err != nil {
//    HandleErr(err)
//    w.WriteHeader(http.StatusInternalServerError)
//    return
//  }

// var keywords  = v["keywords"]
	searchReq := gogpt.SearchRequest{
		Documents: []string{"White House", "hospital", "school"},
		Query:     "the president",
	}
	searchResp, err := c.Search(ctx, "davinci", searchReq)
	if err != nil {
		return
	}

  srchTxt := searchResp.SearchResults[0].Object
  //fmt.Printf("%+v", searchResp)
  // fmt.Fprintf(w, searchResp.SearchResults[0].Text, r)
  fmt.Fprintf(w, srchTxt)
}
