import React from 'react'
import List from './List'
const App = () => {
  React.useEffect(() => {}, [])
  return (
    <div id="app">
      <List initialApiPath="/api" />
    </div>
  )
}

export default App
