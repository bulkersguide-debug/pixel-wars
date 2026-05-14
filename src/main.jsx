import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import FandomPage from './FandomPage'
import FandomDirectory from './FandomDirectory'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/fandoms" element={<FandomDirectory />} />
        <Route path="/fandom/:slug" element={<FandomPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
