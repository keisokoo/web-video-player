import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.scss'
import App from './App'
import axios from 'axios'
import { url } from './url'

axios.defaults.baseURL = url

ReactDOM.render(<App />, document.getElementById('root'))
