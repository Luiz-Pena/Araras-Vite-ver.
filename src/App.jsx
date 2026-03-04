import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastrar from './pages/Cadastrar'
import Categorias from './pages/Categorias'
import Topico from './pages/Topico'
import Perfil from './pages/Perfil'
import { Membros, Regras } from './pages/Membros'
import Eventos from './pages/Eventos'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastrar" element={<Cadastrar />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/topico/:id" element={<Topico />} />
          <Route path="/perfil/:id" element={<Perfil />} />
          <Route path="/membros" element={<Membros />} />
          <Route path="/regras" element={<Regras />} />
          <Route path="/eventos" element={<Eventos />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
