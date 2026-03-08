// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout    from './components/Layout';
import Header   from './components/Header';
import Home      from './pages/Home';
import Login     from './pages/Login';
import Cadastro  from './pages/Cadastro';
import Topico    from './pages/Topico';
import Perfil    from './pages/Perfil';
import Categorias from './pages/Categorias';
import Membros   from './pages/Membros';
import Eventos   from './pages/Eventos';
import Regras    from './pages/Regras';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
          <Header />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/"              element={<Home />} />
              <Route path="/topico/:id"    element={<Topico />} />
              <Route path="/perfil/:id"    element={<Perfil />} />
              <Route path="/categorias"    element={<Categorias />} />
              <Route path="/membros"       element={<Membros />} />
              <Route path="/eventos"       element={<Eventos />} />
              <Route path="/regras"        element={<Regras />} />
            </Route>
            <Route path="/login"         element={<Login />} />
            <Route path="/cadastro"      element={<Cadastro />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
