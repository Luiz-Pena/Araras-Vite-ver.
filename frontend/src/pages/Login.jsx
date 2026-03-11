import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login({ email, senha });
      navigate('/');
    } catch (err) {
      setErro(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container-fluid p-0 vh-100 bg-light">
      <div className="row g-0 h-100">
        
        {/* LADO ESQUERDO: IMAGEM (Aparece apenas em telas grandes) */}
        <div className="col-lg-6 d-none d-lg-block">
          <img 
            src="https://famed.ufu.br/sites/famed.ufu.br/files//imce/45_anos_1.jpeg" 
            className="w-100 h-100" 
            style={{ objectFit: 'cover' }}
            alt="UFU Campus"
          />
        </div>

        {/* LADO DIREITO: CARD ANTIGO CENTRALIZADO */}
        <div className="col-lg-6 d-flex justify-content-center align-items-center p-4">
          <div className="card shadow border-0" style={{ width: '100%', maxWidth: 420 }}>
            
            <div className="card-header bg-white text-center py-3 border-0">
              <Link to="/" className="small text-muted text-decoration-none mb-2">
                ← Voltar para a Home
              </Link>
               <h4 className="mb-0">Login</h4>
            </div>

            <div className="card-body p-4">
              {erro && <div className="alert alert-danger py-2">{erro}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="exemplo@ufu.br"
                    required
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Senha</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Sua senha"
                    required
                    value={senha} 
                    onChange={(e) => setSenha(e.target.value)} 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 shadow-sm"
                  disabled={carregando}
                >
                  {carregando ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>

            <div className="card-footer bg-white text-center py-3 border-0">
              <small className="text-muted">
                Não tem conta? <Link to="/cadastrar" className="text-decoration-none">Cadastre-se</Link>
              </small>
              <br />
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}