import logo from './logo.svg';
import './App.css';
import React from 'react'
import Select from 'react-select'

const options = [
  { value: 'chocolate', label: 'Headline' },
  { value: 'strawberry', label: 'Tweet' },
  { value: 'vanilla', label: 'Vanilla' }
]

const MyComponent = () => (
  <Select options={options} />
)

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div className='container'>
        <MyComponent />
      </div>
    </div>
  );
}

export default App;
