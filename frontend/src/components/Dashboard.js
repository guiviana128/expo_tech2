import React, { useEffect, useState } from 'react';
import { usuariosService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [dados, setDados] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const resposta = await usuariosService.obterAtual();
      setUsuario(resposta.data.usuario);

      // Simular dados de gráfico
      const xpAtual = resposta.data.usuario.xp;
      setDados([
        { dia: 'Segunda', xp: xpAtual - 300 },
        { dia: 'Terça', xp: xpAtual - 200 },
        { dia: 'Quarta', xp: xpAtual - 100 },
        { dia: 'Quinta', xp: xpAtual },
      ]);

      setErro(null);
    } catch (err) {
      setErro('Erro ao carregar dados do usuário');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard">Carregando...</div>;
  if (erro) return <div className="dashboard erro">{erro}</div>;
  if (!usuario) return <div className="dashboard">Usuário não encontrado</div>;

  const percentualNivel = ((usuario.xp % 1000) / 1000) * 100;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>🎮 Bem-vindo, {usuario.nome}!</h1>
      </div>

      <div className="stats-grid">
        {/* Card XP */}
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>XP Total</h3>
            <p className="stat-value">{usuario.xp}</p>
          </div>
        </div>

        {/* Card Nível */}
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Nível</h3>
            <p className="stat-value">{usuario.nivel}</p>
          </div>
        </div>

        {/* Card Progresso */}
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Próximo Nível</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${percentualNivel}%` }}
              ></div>
            </div>
            <p className="stat-small">{Math.round(percentualNivel)}%</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Progresso */}
      <div className="chart-container">
        <h2>📊 Progresso Semanal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="xp" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dicas */}
      <div className="tips-container">
        <h2>💡 Dicas para Ganhar XP</h2>
        <ul>
          <li>🥗 Registre refeições saudáveis: Salada (+80 XP), Frango (+50 XP)</li>
          <li>🏃 Exercite-se regularmente: Corrida (+100 XP/30min), Musculação (+150 XP/1h)</li>
          <li>🔥 Mantenha a consistência: 3 dias seguidos ganham +20 XP extras!</li>
          <li>📈 Suba de nível: A cada 1000 XP você sobe um nível</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
