-- Schema do Banco de Dados NutriXP
-- MySQL

CREATE DATABASE IF NOT EXISTS nutrixp;
USE nutrixp;

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    nivel INT DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atividade TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Refeições
CREATE TABLE refeicoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50), -- café, almoço, lanche, janta
    alimentos TEXT NOT NULL, -- descrição do que comeu
    calorias INT,
    xp_ganho INT,
    data_refeicao DATETIME NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_data (data_refeicao)
);

-- Tabela de Exercícios
CREATE TABLE exercicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- corrida, musculação, yoga, etc
    duracao_minutos INT NOT NULL,
    xp_ganho INT,
    data_exercicio DATETIME NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_data (data_exercicio)
);

-- Tabela de Histórico de XP (para rastrear bônus)
CREATE TABLE historico_xp (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50), -- 'refeição', 'exercício', 'bônus_consistência'
    xp_ganho INT NOT NULL,
    referencia_id INT, -- ID da refeição ou exercício
    data_evento DATETIME NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_data (data_evento)
);

-- Tabela de Metas Diárias (opcional)
CREATE TABLE metas_diarias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    data_meta DATE NOT NULL,
    refeicoes_esperadas INT DEFAULT 3,
    exercicios_minutos INT DEFAULT 30,
    calorias_alvo INT DEFAULT 2000,
    completado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_data (usuario_id, data_meta)
);

-- Índices para melhor performance
CREATE INDEX idx_usuarios_xp ON usuarios(xp DESC);
CREATE INDEX idx_usuarios_nivel ON usuarios(nivel DESC);
