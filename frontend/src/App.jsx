import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Cadastrar from './pages/Cadastrar'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastrar" element={<Cadastrar />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App