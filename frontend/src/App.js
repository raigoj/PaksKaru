import logo from './logo.svg';
import './App.css';
import React, {useState} from 'react'
import Select from 'react-select'
import { QueryClient, useQuery, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TagsInput } from "react-tag-input-component";

const queryClient = new QueryClient()
async function fetchText(kw) {
  console.log(kw)
  return await fetch(`http://localhost:8080/`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(kw)
  }).then((response) =>
    response.json()
  );
}

const options = [
  { value: 'chocolate', label: 'Headline' },
  { value: 'strawberry', label: 'Tweet' },
  { value: 'vanilla', label: 'Vanilla' }
]



const MyComponent = () => (
  <Select options={options} />
)

const CreateButton = ({clicker}) => {
  return (
    <button onClick={clicker}>Create ad</button>
  )
}



function App() {
  const [selected, setSelected] = useState([]);

  const {
    isLoading,
    data: adData,
    isError,
    error,
    refetch
  } = useQuery(["company", selected], () => fetchText(selected), {
    refetchOnWindowFocus: false,
    enabled: false
  });

  const getText = () => {
    refetch()
  }

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <div className='container'>
        <MyComponent />
        <TagsInput
          value={selected}
          onChange={setSelected}
          name="fruits"
          placeHolder="enter keywords"
        />
        <em>press enter or comma to add new tag</em>
        {isLoading && <em>Loading</em>}
        {isError && <h1>ERROR</h1>}
        {adData && <h1>{adData}</h1>}
        <CreateButton clicker={getText} />
      </div>
    </div>
  );
}

export default App;
