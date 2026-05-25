const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'sua_chave_secreta_super_segura';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || '';
const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';

app.use(cors());
app.use(express.json());

// ============= SIMULAÇÃO DE BANCO DE DADOS EM MEMÓRIA =============
const usuarios = [];
const refeicoes = [];
const exercicios = [];
let usuarioIdCounter = 1;
let refeicaoIdCounter = 1;
let exercicioIdCounter = 1;

const normalizarEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
};

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
};

const emitirToken = (usuario) => {
  return jwt.sign(
    { usuario_id: usuario.id },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
};

const encontrarUsuarioPorEmail = (email) => {
  return usuarios.find((usuario) => usuario.email === email);
};

const encontrarUsuarioSocial = (provider, providerId) => {
  return usuarios.find((usuario) => usuario.provider === provider && usuario.provider_id === providerId);
};

const criarUsuarioSocial = (dados) => {
  const novoUsuario = {
    id: usuarioIdCounter++,
    nome: dados.nome || 'Usuário social',
    email: dados.email,
    senha: null,
    provider: dados.provider,
    provider_id: dados.providerId,
    xp: 0,
    nivel: 1,
    data_criacao: new Date(),
  };

  usuarios.push(novoUsuario);
  return novoUsuario;
};

const criarOuAtualizarUsuarioSocial = (provider, providerId, dados) => {
  const usuarioExistente = encontrarUsuarioSocial(provider, providerId) || encontrarUsuarioPorEmail(dados.email);

  if (usuarioExistente) {
    if (!usuarioExistente.provider) {
      usuarioExistente.provider = provider;
      usuarioExistente.provider_id = providerId;
    }

    if (dados.nome && !usuarioExistente.nome) {
      usuarioExistente.nome = dados.nome;
    }

    return usuarioExistente;
  }

  return criarUsuarioSocial({
    provider,
    providerId,
    email: dados.email,
    nome: dados.nome,
  });
};

const verificarGoogleToken = async (idToken) => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID não configurado');
  }

  const resposta = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);

  if (!resposta.ok) {
    throw new Error('Token do Google inválido');
  }

  const payload = await resposta.json();

  if (payload.aud !== GOOGLE_CLIENT_ID) {
    throw new Error('Token do Google inválido para este cliente');
  }

  if (!payload.email) {
    throw new Error('Email não encontrado no token do Google');
  }

  return payload;
};

const verificarAppleToken = async (idToken) => {
  if (!APPLE_CLIENT_ID) {
    throw new Error('APPLE_CLIENT_ID não configurado');
  }

  const jwtHeader = decodeBase64Url(idToken.split('.')[0]);
  const header = JSON.parse(jwtHeader);

  const resposta = await fetch(APPLE_JWKS_URL);

  if (!resposta.ok) {
    throw new Error('Não foi possível obter as chaves do Apple');
  }

  const jwks = await resposta.json();
  const key = jwks.keys.find((entry) => entry.kid === header.kid && entry.kty === 'RSA');

  if (!key) {
    throw new Error('Chave pública do Apple não encontrada');
  }

  const publicKey = crypto.createPublicKey(key);

  const decoded = jwt.verify(idToken, publicKey, {
    algorithms: ['RS256'],
    issuer: APPLE_ISSUER,
    audience: APPLE_CLIENT_ID,
  });

  return decoded;
};

// ============= MIDDLEWARE DE AUTENTICAÇÃO =============
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token ausente' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuarioId = decoded.usuario_id;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

// ============= ENDPOINTS DE AUTENTICAÇÃO =============

// POST /login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const emailNormalizado = normalizarEmail(email);

  if (!emailNormalizado || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  const usuario = usuarios.find(u => u.email === emailNormalizado);

  if (!usuario || !usuario.senha || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const token = emitirToken(usuario);

  res.json({
    sucesso: true,
    token,
    usuario_id: usuario.id
  });
});

// POST /usuarios (Registrar)
app.post('/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;
  const emailNormalizado = normalizarEmail(email);

  if (!nome || !emailNormalizado || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
  }

  if (usuarios.some(u => u.email === emailNormalizado)) {
    return res.status(400).json({ erro: 'Email já cadastrado' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

  const novoUsuario = {
    id: usuarioIdCounter++,
    nome: nome.trim(),
    email: emailNormalizado,
    senha: senhaHash,
    xp: 0,
    nivel: 1,
    data_criacao: new Date()
  };

  usuarios.push(novoUsuario);

  res.status(201).json({
    sucesso: true,
    mensagem: 'Usuário criado com sucesso',
    usuario_id: novoUsuario.id
  });
});

app.post('/auth/social', async (req, res) => {
  const { provider, id_token, email, name } = req.body;

  if (!provider || !id_token) {
    return res.status(400).json({ erro: 'Provider e token são obrigatórios' });
  }

  try {
    let payload = null;

    if (provider === 'google') {
      payload = await verificarGoogleToken(id_token);
    } else if (provider === 'apple') {
      payload = await verificarAppleToken(id_token);
    } else {
      return res.status(400).json({ erro: 'Provider inválido' });
    }

    const emailNormalizado = normalizarEmail(payload.email || email);

    if (!emailNormalizado) {
      return res.status(400).json({ erro: 'Email não encontrado no token do provedor' });
    }

    const usuario = criarOuAtualizarUsuarioSocial(provider, payload.sub, {
      email: emailNormalizado,
      nome: name || payload.name || payload.given_name || emailNormalizado,
    });

    const token = emitirToken(usuario);

    return res.json({
      sucesso: true,
      token,
      usuario_id: usuario.id
    });
  } catch (error) {
    return res.status(401).json({
      erro: error.message || 'Falha ao autenticar com o provedor social'
    });
  }
});

// ============= ENDPOINTS DE USUÁRIOS =============

// GET /usuarios
app.get('/usuarios', (req, res) => {
  const usuariosListados = usuarios.map(u => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    xp: u.xp,
    nivel: u.nivel
  }));

  res.json({
    sucesso: true,
    total: usuariosListados.length,
    usuarios: usuariosListados.sort((a, b) => b.xp - a.xp)
  });
});

// GET /usuarios/<id>
app.get('/usuarios/:id', (req, res) => {
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id));

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  res.json({
    sucesso: true,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      xp: usuario.xp,
      nivel: usuario.nivel,
      data_criacao: usuario.data_criacao
    }
  });
});

// ============= ENDPOINTS DE REFEIÇÕES =============

// GET /refeicoes/<usuario_id>
app.get('/refeicoes/:usuario_id', (req, res) => {
  const usuarioRefeicoes = refeicoes.filter(r => r.usuario_id === parseInt(req.params.usuario_id));

  res.json({
    sucesso: true,
    total: usuarioRefeicoes.length,
    refeicoes: usuarioRefeicoes
  });
});

// POST /refeicoes
app.post('/refeicoes', verificarToken, (req, res) => {
  const { tipo, alimentos, calorias } = req.body;

  if (!tipo || !alimentos) {
    return res.status(400).json({ erro: 'Tipo e alimentos são obrigatórios' });
  }

  const xpGanho = calcularXpRefeicao(alimentos);

  const novaRefeicao = {
    id: refeicaoIdCounter++,
    usuario_id: req.usuarioId,
    tipo,
    alimentos,
    calorias: calorias || 0,
    xp_ganho: xpGanho,
    data_refeicao: new Date()
  };

  refeicoes.push(novaRefeicao);

  const usuario = usuarios.find(u => u.id === req.usuarioId);
  if (usuario) {
    usuario.xp += xpGanho;
    usuario.nivel = Math.floor(usuario.xp / 1000) + 1;
  }

  res.status(201).json({
    sucesso: true,
    mensagem: `Refeição registrada! +${xpGanho} XP`,
    refeicao_id: novaRefeicao.id
  });
});

// DELETE /refeicoes/<id>
app.delete('/refeicoes/:id', verificarToken, (req, res) => {
  const refeicao = refeicoes.find(r => r.id === parseInt(req.params.id) && r.usuario_id === req.usuarioId);

  if (!refeicao) {
    return res.status(404).json({ erro: 'Refeição não encontrada' });
  }

  const usuario = usuarios.find(u => u.id === req.usuarioId);
  if (usuario) {
    usuario.xp -= refeicao.xp_ganho;
    usuario.nivel = Math.floor(usuario.xp / 1000) + 1;
  }

  refeicoes.splice(refeicoes.indexOf(refeicao), 1);

  res.json({
    sucesso: true,
    mensagem: 'Refeição removida'
  });
});

// ============= ENDPOINTS DE EXERCÍCIOS =============

// GET /exercicios/<usuario_id>
app.get('/exercicios/:usuario_id', (req, res) => {
  const usuarioExercicios = exercicios.filter(e => e.usuario_id === parseInt(req.params.usuario_id));

  res.json({
    sucesso: true,
    total: usuarioExercicios.length,
    exercicios: usuarioExercicios
  });
});

// POST /exercicios
app.post('/exercicios', verificarToken, (req, res) => {
  const { tipo, duracao_minutos } = req.body;

  if (!tipo || !duracao_minutos) {
    return res.status(400).json({ erro: 'Tipo e duração são obrigatórios' });
  }

  const xpGanho = calcularXpExercicio(tipo, duracao_minutos);

  const novoExercicio = {
    id: exercicioIdCounter++,
    usuario_id: req.usuarioId,
    tipo,
    duracao_minutos: parseInt(duracao_minutos),
    xp_ganho: xpGanho,
    data_exercicio: new Date()
  };

  exercicios.push(novoExercicio);

  const usuario = usuarios.find(u => u.id === req.usuarioId);
  if (usuario) {
    usuario.xp += xpGanho;
    usuario.nivel = Math.floor(usuario.xp / 1000) + 1;
  }

  res.status(201).json({
    sucesso: true,
    mensagem: `Exercício registrado! +${xpGanho} XP`,
    exercicio_id: novoExercicio.id
  });
});

// DELETE /exercicios/<id>
app.delete('/exercicios/:id', verificarToken, (req, res) => {
  const exercicio = exercicios.find(e => e.id === parseInt(req.params.id) && e.usuario_id === req.usuarioId);

  if (!exercicio) {
    return res.status(404).json({ erro: 'Exercício não encontrado' });
  }

  const usuario = usuarios.find(u => u.id === req.usuarioId);
  if (usuario) {
    usuario.xp -= exercicio.xp_ganho;
    usuario.nivel = Math.floor(usuario.xp / 1000) + 1;
  }

  exercicios.splice(exercicios.indexOf(exercicio), 1);

  res.json({
    sucesso: true,
    mensagem: 'Exercício removido'
  });
});

// ============= ENDPOINT DE RANKING =============

// GET /ranking
app.get('/ranking', (req, res) => {
  const limite = parseInt(req.query.limite) || 10;

  const ranking = usuarios
    .map(u => ({
      id: u.id,
      nome: u.nome,
      xp: u.xp,
      nivel: u.nivel
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limite)
    .map((u, i) => ({
      ...u,
      posicao: i + 1
    }));

  res.json({
    sucesso: true,
    total: ranking.length,
    ranking
  });
});

// ============= HEALTH CHECK =============

app.get('/health', (req, res) => {
  res.json({ status: 'API funcionando!' });
});

// ============= FUNÇÕES AUXILIARES =============

function calcularXpRefeicao(alimentos) {
  const alimentosLower = alimentos.toLowerCase();

  const saudaveis = ['salada', 'brócolis', 'maçã', 'banana', 'frango', 'peixe', 'ovo', 'iogurte'];
  const naoSaudaveis = ['pizza', 'hambúrguer', 'refrigerante', 'doce', 'batata_frita'];

  let xp = 50;

  for (let alimento of saudaveis) {
    if (alimentosLower.includes(alimento)) {
      xp += 30;
    }
  }

  for (let alimento of naoSaudaveis) {
    if (alimentosLower.includes(alimento)) {
      xp -= 20;
    }
  }

  return Math.max(10, xp);
}

function calcularXpExercicio(tipo, duracaoMinutos) {
  const tipoLower = tipo.toLowerCase();

  const xpPorMinuto = {
    'corrida': 3,
    'caminhada': 1.5,
    'musculação': 2.5,
    'yoga': 1.2,
    'bicicleta': 2,
    'natação': 3.5
  };

  let xpBase = 50;

  for (let tipoChave in xpPorMinuto) {
    if (tipoLower.includes(tipoChave)) {
      xpBase = Math.round(duracaoMinutos * xpPorMinuto[tipoChave]);
      break;
    }
  }

  return Math.max(20, xpBase);
}

// ============= INICIAR SERVIDOR =============

app.listen(PORT, () => {
  console.log(`🚀 API NutriXP rodando em http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
