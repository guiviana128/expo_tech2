import React, { useState, useEffect } from 'react';
import { rankingService } from '../services/api';
import './Ranking.css';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [limite, setLimite] = useState(10);

  useEffect(() => {
    carregarRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limite]);

  const carregarRanking = async () => {
    try {
      setLoading(true);
      const resposta = await rankingService.obter(limite);
      setRanking(resposta.data.ranking);
      setErro(null);
    } catch (err) {
      setErro('Erro ao carregar ranking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const obterInsignia = (posicao) => {
    switch (posicao) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '⭐';
    }
  };

  const obterCor = (posicao) => {
    switch (posicao) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#666';
    }
  };

  if (loading) return <div className="ranking">Carregando ranking...</div>;
  if (erro) return <div className="ranking erro">{erro}</div>;

  return (
    <div className="ranking">
      <h1>🏆 Ranking de Usuários</h1>

      <div className="filtro">
        <label>Mostrar top:</label>
        <select value={limite} onChange={(e) => setLimite(parseInt(e.target.value))}>
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>

      <div className="ranking-container">
        {ranking.length === 0 ? (
          <p>Nenhum usuário cadastrado ainda</p>
        ) : (
          ranking.map((usuario) => (
            <div
              key={usuario.id}
              className={`ranking-card ${usuario.posicao <= 3 ? 'top-3' : ''}`}
              style={{
                borderLeftColor: obterCor(usuario.posicao),
              }}
            >
              <div className="posicao-insignia">
                <span className="insignia">{obterInsignia(usuario.posicao)}</span>
                <span className="posicao">#{usuario.posicao}</span>
              </div>

              <div className="usuario-info">
                <h3>{usuario.nome}</h3>
                <div className="nivel-info">
                  <span className="nivel">🎮 Nível {usuario.nivel}</span>
                </div>
              </div>

              <div className="xp-info">
                <p className="xp-total">{usuario.xp} XP</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Informações sobre o sistema */}
      <div className="info-box">
        <h2>📚 Como o Ranking Funciona</h2>
        <ul>
          <li>🥇 <strong>1º lugar:</strong> Mais XP acumulado (ouro)</li>
          <li>🥈 <strong>2º lugar:</strong> Segunda maior quantidade (prata)</li>
          <li>🥉 <strong>3º lugar:</strong> Terceira maior quantidade (bronze)</li>
          <li>⭐ <strong>Demais:</strong> Continuam acumulando XP</li>
          <li>📈 <strong>Nível:</strong> Sobe a cada 1000 XP</li>
        </ul>
      </div>
    </div>
  );
}

export default Ranking;
