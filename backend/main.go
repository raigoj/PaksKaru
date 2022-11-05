package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	gogpt "github.com/sashabaranov/go-gpt3"
)

func main() {
  http.HandleFunc("/", Middleware(mainHandler))
  http.HandleFunc("/img", Middleware(imgHandler))
  log.Fatal(http.ListenAndServe(":8080", nil))
}

func imgHandler(w http.ResponseWriter, r *http.Request) {
  var x = r.URL.Query().Get("s")

  url :=  "https://api.replicate.com/v1/predictions"

  // Create a Bearer string by appending string access token
  var bearer = "Token " + "8b103a425be7b3d7cb4190158ad4e47f1509d07f"
  jsonBody := []byte(`{"version": "8abccf52e7cba9f6e82317253f4a3549082e966db5584e92c808ece132037776", "input": {"prompt":"Illustration of ` + x + `"}}`)
  bodyReader := bytes.NewReader(jsonBody)
  // Create a new request using http
  req, err := http.NewRequest(http.MethodPost, url, bodyReader)

    // add authorization header to the req
    req.Header.Add("Authorization", bearer)

    // Send req using http Client
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        log.Println("Error on response.\n[ERROR] -", err)
    }
    defer resp.Body.Close()

  body, err := ioutil.ReadAll(resp.Body)
  if err != nil {
    log.Println("Error while reading the response bytes:", err)
  }
  fmt.Printf("client: response body: %s\n", body)
  type Response struct {
    CompletedAt interface{} `json:"completed_at"`
    CreatedAt   time.Time   `json:"created_at"`
    Error       interface{} `json:"error"`
    Hardware    string      `json:"hardware"`
    ID          string      `json:"id"`
    Input       struct {
      Prompt string `json:"prompt"`
    } `json:"input"`
    Logs    interface{} `json:"logs"`
    Metrics struct {
    } `json:"metrics"`
    Output    interface{} `json:"output"`
    StartedAt interface{} `json:"started_at"`
    Status    string      `json:"status"`
    Urls      struct {
      Get    string `json:"get"`
      Cancel string `json:"cancel"`
    } `json:"urls"`
    Version          string      `json:"version"`
    WebhookCompleted interface{} `json:"webhook_completed"`
  }
  // snippet only
  var result Response
  if err := json.Unmarshal(body, &result); err != nil {   // Parse []byte to go struct pointer
    fmt.Println("Can not unmarshal JSON")
  }
  fmt.Println(result)
  req, err = http.NewRequest(http.MethodGet, result.Urls.Get, nil)

    // add authorization header to the req
    req.Header.Add("Authorization", bearer)

  // Send req using http Client
  resp, err = client.Do(req)
  if err != nil {
    fmt.Println("SHIT")
    log.Println("Error on response.\n[ERROR] -", err)
  }

  body, err = ioutil.ReadAll(resp.Body)
  if err != nil {
    log.Println("Error while reading the response bytes:", err)
  }
  type ImgResponse struct {
    CompletedAt interface{} `json:"completed_at"`
    CreatedAt   time.Time   `json:"created_at"`
    Error       interface{} `json:"error"`
    Hardware    string      `json:"hardware"`
    ID          string      `json:"id"`
    Input       struct {
      Prompt string `json:"prompt"`
    } `json:"input"`
    Logs    string `json:"logs"`
    Metrics struct {
    } `json:"metrics"`
    Output    string    `json:"output"`
    StartedAt time.Time `json:"started_at"`
    Status    string    `json:"status"`
    Urls      struct {
      Get    string `json:"get"`
      Cancel string `json:"cancel"`
    } `json:"urls"`
    Version          string      `json:"version"`
    WebhookCompleted interface{} `json:"webhook_completed"`
  }
  var imgResult ImgResponse
  if err := json.Unmarshal(body, &imgResult); err != nil {   // Parse []byte to go struct pointer
    fmt.Println("Can not unmarshal JSON")
  }
  fmt.Println(imgResult.Output)
  var image = ""
  for (image == "") {
    req, err = http.NewRequest(http.MethodGet, result.Urls.Get, nil)

    // add authorization header to the req
    req.Header.Add("Authorization", bearer)

  // Send req using http Client
  resp, err = client.Do(req)
  if err != nil {
    log.Println("Error on response.\n[ERROR] -", err)
  }

    body, err = ioutil.ReadAll(resp.Body)
    if err != nil {
      log.Println("Error while reading the response bytes:", err)
    }
    type ImgResponse struct {
      CompletedAt time.Time   `json:"completed_at"`
      CreatedAt   time.Time   `json:"created_at"`
      Error       interface{} `json:"error"`
      Hardware    string      `json:"hardware"`
      ID          string      `json:"id"`
      Input       struct {
        Prompt string `json:"prompt"`
      } `json:"input"`
      Logs    string `json:"logs"`
      Metrics struct {
        PredictTime float64 `json:"predict_time"`
      } `json:"metrics"`
      Output    []string  `json:"output"`
      StartedAt time.Time `json:"started_at"`
      Status    string    `json:"status"`
      Urls      struct {
        Get    string `json:"get"`
        Cancel string `json:"cancel"`
      } `json:"urls"`
      Version          string      `json:"version"`
      WebhookCompleted interface{} `json:"webhook_completed"`
    }
    var imgResult ImgResponse
    if err := json.Unmarshal(body, &imgResult); err != nil {   // Parse []byte to go struct pointer
      fmt.Println("Can not unmarshal JSON")
    }

    if (imgResult.Status == "succeeded") {
      image = imgResult.Output[0]
      fmt.Println(image)
      resp, err := json.Marshal(imgResult)
      if err != nil {
        fmt.Println("ERROR 2", err)
      }
      w.Write(resp)
      return
    }
  }
}
func mainHandler(w http.ResponseWriter, r *http.Request) {
  c := gogpt.NewClient("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")
  ctx := context.Background()
  var v map[string][]string

  err := json.NewDecoder(r.Body).Decode(&v)

  if err != nil {
    return
  }
  var prompt = `Topic: Sport, athlete, clothing
  Headline: Just do it

  Topic: Burgers, food, snacks
  Headline: I'm Lovin' It

  Topic: Adventure, fun, family
  Headline: The happiest place on Earth

  Topic: {example}
  Headline:`

  var keywords  = v["keywords"]
  fmt.Println(keywords)
  var b = strings.Join(keywords, ", ")
	req := gogpt.CompletionRequest{
		Model: "text-davinci-002",
		MaxTokens: 10,
    N: 0,
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
