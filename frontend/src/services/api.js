import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Configurar interceptor para incluir token em todas as requisições
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token ao header se existir
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============= SERVIÇOS DE AUTENTICAÇÃO =============

export const authService = {
  // Login
  login: (email, senha) => {
    return api.post('/login', { email, senha });
  },

  // Registrar novo usuário
  registrar: (nome, email, senha) => {
    return api.post('/usuarios', { nome, email, senha });
  },

  // Login social
  socialLogin: (provider, payload = {}) => {
    return api.post('/auth/social', {
      provider,
      ...payload,
    });
  },

  // Logout (limpar token local)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_id');
  },

  // Verificar se usuário está autenticado
  estaAutenticado: () => {
    return !!localStorage.getItem('token');
  },

  // Obter token armazenado
  getToken: () => {
    return localStorage.getItem('token');
  },
};

// ============= SERVIÇOS DE USUÁRIOS =============

export const usuariosService = {
  // GET - Listar todos os usuários
  listar: () => {
    return api.get('/usuarios');
  },

  // GET - Obter usuário por ID
  obterPorId: (id) => {
    return api.get(`/usuarios/${id}`);
  },

  // Obter usuário atual
  obterAtual: () => {
    const usuario_id = localStorage.getItem('usuario_id');
    if (!usuario_id) {
      return Promise.reject('Usuário não autenticado');
    }
    return api.get(`/usuarios/${usuario_id}`);
  },
};

// ============= SERVIÇOS DE REFEIÇÕES =============

export const refeicoesService = {
  // GET - Listar refeições de um usuário
  listar: (usuario_id) => {
    return api.get(`/refeicoes/${usuario_id}`);
  },

  // POST - Registrar uma refeição
  criar: (tipo, alimentos, calorias = null, data_refeicao = null) => {
    const payload = {
      tipo,
      alimentos,
      calorias: calorias || 0,
      data_refeicao: data_refeicao || new Date().toISOString(),
    };
    return api.post('/refeicoes', payload);
  },

  // DELETE - Remover uma refeição
  deletar: (refeicao_id) => {
    return api.delete(`/refeicoes/${refeicao_id}`);
  },
};

// ============= SERVIÇOS DE EXERCÍCIOS =============

export const exerciciosService = {
  // GET - Listar exercícios de um usuário
  listar: (usuario_id) => {
    return api.get(`/exercicios/${usuario_id}`);
  },

  // POST - Registrar um exercício
  criar: (tipo, duracao_minutos, data_exercicio = null) => {
    const payload = {
      tipo,
      duracao_minutos,
      data_exercicio: data_exercicio || new Date().toISOString(),
    };
    return api.post('/exercicios', payload);
  },

  // DELETE - Remover um exercício
  deletar: (exercicio_id) => {
    return api.delete(`/exercicios/${exercicio_id}`);
  },
};

// ============= SERVIÇOS DE RANKING =============

export const rankingService = {
  // GET - Obter ranking de usuários
  obter: (limite = 10) => {
    return api.get(`/ranking?limite=${limite}`);
  },
};

// ============= SERVIÇO DE HEALTH CHECK =============

export const healthService = {
  verificar: () => {
    return api.get('/health');
  },
};

export default api;
