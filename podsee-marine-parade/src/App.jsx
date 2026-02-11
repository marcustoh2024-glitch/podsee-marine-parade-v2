import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ResultsPage from './pages/ResultsPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/civictyperadmin" element={<AdminPage />} />
    </Routes>
  )
}

export default App
