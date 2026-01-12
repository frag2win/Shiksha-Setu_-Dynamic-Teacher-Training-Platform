import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('checking...')

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('disconnected'))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shiksha-Setu</h1>
        <h2>Dynamic Teacher Training Platform</h2>
        <p>API Status: <span className={apiStatus === 'healthy' ? 'status-ok' : 'status-error'}>{apiStatus}</span></p>
      </header>
      
      <main className="App-main">
        <div className="welcome-message">
          <h3>Command Center</h3>
          <p>Platform initialization in progress...</p>
        </div>
      </main>
    </div>
  )
}

export default App
