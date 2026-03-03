import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// registerSW is provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// set up service worker with automatic updates and callbacks
const updateSW = registerSW({
  onNeedRefresh() {
    // you can prompt the user to refresh here
    console.log('New content available, please refresh.')
  },
  onOfflineReady() {
    console.log('App is ready to work offline.')
  }
})
