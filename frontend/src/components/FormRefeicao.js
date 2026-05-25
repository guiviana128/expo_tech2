import React, { useState } from 'react';
import { refeicoesService } from '../services/api';
import './FormRefeicao.css';

function FormRefeicao({ onRefeicaoCriada }) {
  const [tipo, setTipo] = useState('almoço');
  const [alimentos, setAlimentos] = useState('');
  const [calorias, setCalorias] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!alimentos.trim()) {
      setMensagem('❌ Descreva os alimentos que comeu');
      return;
    }

    try {
      setCarregando(true);
      const resposta = await refeicoesService.criar(
        tipo,
        alimentos,
        calorias ? parseInt(calorias) : null
      );

      setMensagem(`✅ ${resposta.data.mensagem}`);
      setAlimentos('');
      setCalorias('');

      // Notificar componente pai
      if (onRefeicaoCriada) {
        onRefeicaoCriada();
      }

      // Limpar mensagem após 3 segundos
      setTimeout(() => setMensagem(''), 3000);
    } catch (erro) {
      setMensagem(`❌ ${erro.response?.data?.erro || 'Erro ao registrar refeição'}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="form-refeicao">
      <h2>🍽️ Registrar Refeição</h2>

      {mensagem && <div className="mensagem">{mensagem}</div>}

      <form onSubmit={handleSubmit}>
        {/* Campo Tipo */}
        <div className="form-group">
          <label htmlFor="tipo">Tipo de Refeição</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="café">☕ Café da Manhã</option>
            <option value="almoço">🍽️ Almoço</option>
            <option value="lanche">🍎 Lanche</option>
            <option value="janta">🌙 Janta</option>
          </select>
        </div>

        {/* Campo Alimentos */}
        <div className="form-group">
          <label htmlFor="alimentos">O que você comeu?</label>
          <textarea
            id="alimentos"
            placeholder="Ex: Salada com frango, brócolis, arroz integral..."
            value={alimentos}
            onChange={(e) => setAlimentos(e.target.value)}
            rows="4"
          ></textarea>
        </div>

        {/* Campo Calorias */}
        <div className="form-group">
          <label htmlFor="calorias">Calorias (opcional)</label>
          <input
            id="calorias"
            type="number"
            placeholder="Ex: 500"
            value={calorias}
            onChange={(e) => setCalorias(e.target.value)}
            min="0"
          />
        </div>

        {/* Botão Enviar */}
        <button type="submit" disabled={carregando}>
          {carregando ? '⏳ Registrando...' : '✅ Registrar Refeição'}
        </button>
      </form>

      {/* Tabela de Alimentos Recomendados */}
      <div className="alimentos-info">
        <h3>📊 Valores de XP por Alimento</h3>
        <table>
          <thead>
            <tr>
              <th>Alimento</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            <tr className="saudavel">
              <td>🥗 Salada</td>
              <td>+80 XP</td>
            </tr>
            <tr className="saudavel">
              <td>🥦 Brócolis</td>
              <td>+50 XP</td>
            </tr>
            <tr className="saudavel">
              <td>🍗 Frango</td>
              <td>+50 XP</td>
            </tr>
            <tr className="saudavel">
              <td>🍎 Maçã</td>
              <td>+50 XP</td>
            </tr>
            <tr className="nao-saudavel">
              <td>🍕 Pizza</td>
              <td>+10 XP</td>
            </tr>
            <tr className="nao-saudavel">
              <td>🍔 Hambúrguer</td>
              <td>+10 XP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FormRefeicao;
