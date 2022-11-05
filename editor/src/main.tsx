import ReactDOM from "react-dom/client"
import Provider from "./Provider"
import Router from "./Router"
import Container from "./Container"
import "./styles/styles.css"
import { QueryClient, useQuery, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider>
    <Container>
      <QueryClientProvider client={queryClient}>
        <Router />
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </Container>
  </Provider>
)
