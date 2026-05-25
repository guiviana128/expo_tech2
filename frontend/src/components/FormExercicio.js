import React, { useState } from 'react';
import { exerciciosService } from '../services/api';
import './FormExercicio.css';

function FormExercicio({ onExercicioCriado }) {
  const [tipo, setTipo] = useState('corrida');
  const [duracao, setDuracao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const xpPorTipo = {
    corrida: 3,
    caminhada: 1.5,
    musculacao: 2.5,
    yoga: 1.2,
    bicicleta: 2,
    natacao: 3.5,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!duracao || parseInt(duracao) <= 0) {
      setMensagem('❌ Insira uma duração válida');
      return;
    }

    try {
      setCarregando(true);
      const resposta = await exerciciosService.criar(tipo, parseInt(duracao));

      setMensagem(`✅ ${resposta.data.mensagem}`);
      setDuracao('');

      // Notificar componente pai
      if (onExercicioCriado) {
        onExercicioCriado();
      }

      // Limpar mensagem após 3 segundos
      setTimeout(() => setMensagem(''), 3000);
    } catch (erro) {
      setMensagem(`❌ ${erro.response?.data?.erro || 'Erro ao registrar exercício'}`);
    } finally {
      setCarregando(false);
    }
  };

  const calcularXpEstimado = () => {
    if (!duracao) return 0;
    const taxa = xpPorTipo[tipo] || 1;
    return Math.round(parseInt(duracao) * taxa);
  };

  return (
    <div className="form-exercicio">
      <h2>🏋️ Registrar Exercício</h2>

      {mensagem && <div className="mensagem">{mensagem}</div>}

      <form onSubmit={handleSubmit}>
        {/* Campo Tipo */}
        <div className="form-group">
          <label htmlFor="tipo">Tipo de Exercício</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="corrida">🏃 Corrida</option>
            <option value="caminhada">🚶 Caminhada</option>
            <option value="musculacao">💪 Musculação</option>
            <option value="yoga">🧘 Yoga</option>
            <option value="bicicleta">🚴 Bicicleta</option>
            <option value="natacao">🏊 Natação</option>
          </select>
        </div>

        {/* Campo Duração */}
        <div className="form-group">
          <label htmlFor="duracao">Duração (minutos)</label>
          <input
            id="duracao"
            type="number"
            placeholder="Ex: 30"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            min="1"
          />
        </div>

        {/* XP Estimado */}
        {duracao && (
          <div className="xp-estimado">
            ✨ Você vai ganhar aproximadamente <strong>+{calcularXpEstimado()} XP</strong>
          </div>
        )}

        {/* Botão Enviar */}
        <button type="submit" disabled={carregando}>
          {carregando ? '⏳ Registrando...' : '✅ Registrar Exercício'}
        </button>
      </form>

      {/* Tabela de Exercícios */}
      <div className="exercicios-info">
        <h3>📊 Valores de XP por Exercício</h3>
        <table>
          <thead>
            <tr>
              <th>Exercício</th>
              <th>XP por Minuto</th>
              <th>30 min</th>
              <th>1 hora</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🏃 Corrida</td>
              <td>3 XP</td>
              <td>+90 XP</td>
              <td>+180 XP</td>
            </tr>
            <tr>
              <td>🚶 Caminhada</td>
              <td>1.5 XP</td>
              <td>+45 XP</td>
              <td>+90 XP</td>
            </tr>
            <tr>
              <td>💪 Musculação</td>
              <td>2.5 XP</td>
              <td>+75 XP</td>
              <td>+150 XP</td>
            </tr>
            <tr>
              <td>🧘 Yoga</td>
              <td>1.2 XP</td>
              <td>+36 XP</td>
              <td>+72 XP</td>
            </tr>
            <tr>
              <td>🚴 Bicicleta</td>
              <td>2 XP</td>
              <td>+60 XP</td>
              <td>+120 XP</td>
            </tr>
            <tr>
              <td>🏊 Natação</td>
              <td>3.5 XP</td>
              <td>+105 XP</td>
              <td>+210 XP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FormExercicio;
