import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FormRefeicao from './components/FormRefeicao';
import FormExercicio from './components/FormExercicio';
import Ranking from './components/Ranking';
import { authService } from './services/api';
import './App.css';

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const APPLE_SCRIPT_URL = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

const normalizarEmail = (valor) => valor.trim().toLowerCase();

const gerarNonce = () =>
  `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [estaRegistrando, setEstaRegistrando] = useState(false);
  const [nome, setNome] = useState('');
  const navigate = useNavigate();

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  const appleClientId = process.env.REACT_APP_APPLE_CLIENT_ID || '';

  const autenticarSocial = useCallback(async (provider, payload) => {
    try {
      setCarregando(true);
      setErro('');
      const resposta = await authService.socialLogin(provider, payload);

      localStorage.setItem('token', resposta.data.token);
      localStorage.setItem('usuario_id', resposta.data.usuario_id);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.erro || `Erro ao autenticar com ${provider}`);
    } finally {
      setCarregando(false);
    }
  }, [navigate]);

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response?.credential) {
      setErro('Google não retornou um token válido.');
      return;
    }

    await autenticarSocial('google', {
      id_token: response.credential,
    });
  }, [autenticarSocial]);

  const handleAppleLogin = () => {
    if (!appleClientId) {
      setErro('Configure REACT_APP_APPLE_CLIENT_ID para habilitar o Apple Login.');
      return;
    }

    if (!window.AppleID?.auth) {
      setErro('O SDK do Apple ainda não foi carregado. Tente novamente em instantes.');
      return;
    }

    const nonce = gerarNonce();

    window.AppleID.auth.signIn({
      clientId: appleClientId,
      scope: 'name email',
      redirectURI: window.location.origin,
      state: 'nutrixp-auth',
      nonce,
      usePopup: true,
      onSuccess: async (response) => {
        const nomeCompleto = [
          response?.user?.name?.firstName,
          response?.user?.name?.lastName,
        ]
          .filter(Boolean)
          .join(' ')
          .trim();

        await autenticarSocial('apple', {
          id_token: response?.authorization?.id_token,
          email: response?.user?.email || '',
          name: nomeCompleto,
        });
      },
      onFailure: (error) => {
        setErro(error?.error || 'Erro ao autenticar com Apple');
      },
    });
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      if (!googleClientId) {
        setErro('Configure REACT_APP_GOOGLE_CLIENT_ID para habilitar o Google Login.');
        return;
      }

      if (!window.google?.accounts?.id) {
        setErro('O SDK do Google ainda está carregando. Tente novamente em instantes.');
        return;
      }

      window.google.accounts.id.prompt();
      return;
    }

    handleAppleLogin();
  };

  useEffect(() => {
    let googleScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);

    if (googleClientId && !window.google?.accounts?.id) {
      if (!googleScript) {
        googleScript = document.createElement('script');
        googleScript.src = GOOGLE_SCRIPT_URL;
        googleScript.async = true;
        googleScript.defer = true;
        document.body.appendChild(googleScript);
      }

      const initializeGoogle = () => {
        if (!window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        });
      };

      if (googleScript.readyState === 'complete' || googleScript.readyState === 'loaded') {
        initializeGoogle();
      } else {
        googleScript.onload = initializeGoogle;
      }
    }

    let appleScript = document.querySelector(`script[src="${APPLE_SCRIPT_URL}"]`);

    if (appleClientId && !window.AppleID?.auth) {
      if (!appleScript) {
        appleScript = document.createElement('script');
        appleScript.src = APPLE_SCRIPT_URL;
        appleScript.async = true;
        document.body.appendChild(appleScript);
      }
    }
  }, [googleClientId, appleClientId, handleGoogleResponse]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailNormalizado = normalizarEmail(email);

    try {
      setCarregando(true);
      setErro('');
      const resposta = await authService.login(emailNormalizado, senha);
      localStorage.setItem('token', resposta.data.token);
      localStorage.setItem('usuario_id', resposta.data.usuario_id);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    const emailNormalizado = normalizarEmail(email);

    if (!nome || !emailNormalizado || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      await authService.registrar(nome.trim(), emailNormalizado, senha);
      setEstaRegistrando(false);
      setEmail('');
      setSenha('');
      setNome('');
      alert('✅ Conta criada com sucesso! Agora faça login');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>NutriXP</h1>
        </div>
        <p className="subtitle">
          Acompanhe hábitos saudáveis, evolua com XP e mantenha seu progresso sempre em dia.
        </p>

        <div className="login-hero">
          <p>Entrar com sua conta ou continuar com uma opção social para simplificar o acesso.</p>
        </div>

        {erro && <div className="erro-msg">{erro}</div>}

        <div className="login-actions">
          <button
            type="button"
            className="social-btn social-btn--apple"
            onClick={() => handleSocialLogin('Apple')}
            disabled={carregando}
          >
             Entrar com Apple
          </button>
          <button
            type="button"
            className="social-btn social-btn--google"
            onClick={() => handleSocialLogin('Google')}
            disabled={carregando}
          >
            G Entrar com Google
          </button>
        </div>

        <div className="login-divider">ou continue com e-mail</div>

        <form onSubmit={estaRegistrando ? handleRegistro : handleLogin}>
          {estaRegistrando && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="login-actions">
            <button type="submit" disabled={carregando}>
              {carregando ? '⏳ Carregando...' : estaRegistrando ? '✅ Criar conta' : '🔓 Entrar'}
            </button>
          </div>
        </form>

        <p className="toggle-form">
          {estaRegistrando ? 'Já tem conta? ' : 'Ainda não tem conta? '}
          <button
            type="button"
            onClick={() => {
              setEstaRegistrando(!estaRegistrando);
              setErro('');
            }}
          >
            {estaRegistrando ? 'Faça login' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </div>
  );
}

function MainApp() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">NutriXP</h1>
          <ul className="nav-links">
            <li>
              <Link to="/dashboard">📊 Dashboard</Link>
            </li>
            <li>
              <Link to="/refeicoes">🍽️ Refeições</Link>
            </li>
            <li>
              <Link to="/exercicios">🏋️ Exercícios</Link>
            </li>
            <li>
              <Link to="/ranking">🏆 Ranking</Link>
            </li>
          </ul>
          <div className="logout-wrapper">
            <button className="logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/refeicoes" element={<FormRefeicao />} />
          <Route path="/exercicios" element={<FormExercicio />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
