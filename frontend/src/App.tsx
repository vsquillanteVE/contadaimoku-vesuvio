import React from 'react'
import './App.css'
import Header from './components/Header'
import Counter from './components/Counter'
import Information from './components/Information'

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Counter />
        <Information />
      </main>
    </div>
  )
}

export default App
