import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 這裡不需要 import index.css 了，因為我們用了上面的 CDN

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)