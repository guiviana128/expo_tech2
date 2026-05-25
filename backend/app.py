# -*- coding: utf-8 -*-
import os
import sqlite3
from datetime import datetime
from functools import wraps

from flask import Flask, jsonify, request
from flask_cors import CORS
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'nutrixp.db')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'nutrixp-dev-secret')
CORS(app)

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    try:
        conn.executescript(
            '''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                xp INTEGER DEFAULT 0,
                nivel INTEGER DEFAULT 1,
                data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS refeicoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                tipo TEXT NOT NULL,
                alimentos TEXT NOT NULL,
                calorias INTEGER DEFAULT 0,
                xp_ganho INTEGER NOT NULL,
                data_refeicao TEXT NOT NULL,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS exercicios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                tipo TEXT NOT NULL,
                duracao_minutos INTEGER NOT NULL,
                xp_ganho INTEGER NOT NULL,
                data_exercicio TEXT NOT NULL,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS historico_xp (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                tipo TEXT NOT NULL,
                xp_ganho INTEGER NOT NULL,
                referencia_id INTEGER,
                data_evento TEXT NOT NULL,
                criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_refeicoes_usuario ON refeicoes (usuario_id);
            CREATE INDEX IF NOT EXISTS idx_exercicios_usuario ON exercicios (usuario_id);
            CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico_xp (usuario_id);
            '''
        )
        conn.commit()
    finally:
        conn.close()


def normalizar_email(email):
    if not isinstance(email, str):
        return ''
    return email.strip().lower()


def criar_token(usuario_id):
    return serializer.dumps({'usuario_id': usuario_id}, salt='auth')


def validar_token(token):
    try:
        payload = serializer.loads(token, salt='auth', max_age=7 * 24 * 60 * 60)
        return payload.get('usuario_id')
    except (SignatureExpired, BadSignature):
        return None


def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization', '')
        if not token.startswith('Bearer '):
            return jsonify({'erro': 'Token ausente'}), 401

        usuario_id = validar_token(token.split(' ', 1)[1])
        if usuario_id is None:
            return jsonify({'erro': 'Token inválido'}), 401

        return func(usuario_id, *args, **kwargs)

    return wrapper


def atualizar_nivel(usuario_id, conn=None):
    own_conn = conn is None
    if own_conn:
        conn = get_connection()

    try:
        usuario = conn.execute(
            'SELECT xp FROM usuarios WHERE id = ?',
            (usuario_id,),
        ).fetchone()

        if usuario is None:
            return

        novo_nivel = (usuario['xp'] // 1000) + 1
        conn.execute(
            'UPDATE usuarios SET nivel = ? WHERE id = ?',
            (novo_nivel, usuario_id),
        )
        conn.commit()
    finally:
        if own_conn:
            conn.close()


def calcular_xp_refeicao(alimentos):
    texto = (alimentos or '').lower()
    saudaveis = ['salada', 'brócolis', 'maçã', 'banana', 'frango', 'peixe', 'ovo', 'iogurte']
    nao_saudaveis = ['pizza', 'hambúrguer', 'refrigerante', 'doce', 'batata_frita']
    xp = 50

    for alimento in saudaveis:
        if alimento in texto:
            xp += 30

    for alimento in nao_saudaveis:
        if alimento in texto:
            xp -= 20

    return max(10, xp)


def calcular_xp_exercicio(tipo, duracao_minutos):
    texto = (tipo or '').lower()
    taxa = 0

    if 'corrida' in texto:
        taxa = 3
    elif 'caminhada' in texto:
        taxa = 1.5
    elif 'musculação' in texto:
        taxa = 2.5
    elif 'yoga' in texto:
        taxa = 1.2
    elif 'bicicleta' in texto:
        taxa = 2
    elif 'natação' in texto or 'natacao' in texto:
        taxa = 3.5

    if taxa == 0:
        taxa = 1

    xp = int(float(duracao_minutos) * taxa)
    return max(20, xp)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'API funcionando!'}), 200


@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    conn = get_connection()
    try:
        usuarios = conn.execute(
            'SELECT id, nome, email, xp, nivel FROM usuarios ORDER BY xp DESC'
        ).fetchall()
        return jsonify({
            'sucesso': True,
            'total': len(usuarios),
            'usuarios': [dict(usuario) for usuario in usuarios],
        }), 200
    finally:
        conn.close()


@app.route('/usuarios/<int:usuario_id>', methods=['GET'])
def obter_usuario(usuario_id):
    conn = get_connection()
    try:
        usuario = conn.execute(
            'SELECT id, nome, email, xp, nivel, data_criacao FROM usuarios WHERE id = ?',
            (usuario_id,),
        ).fetchone()

        if usuario is None:
            return jsonify({'erro': 'Usuário não encontrado'}), 404

        return jsonify({'sucesso': True, 'usuario': dict(usuario)}), 200
    finally:
        conn.close()


@app.route('/usuarios', methods=['POST'])
def criar_usuario():
    dados = request.get_json(silent=True) or {}
    nome = (dados.get('nome') or '').strip()
    email = normalizar_email(dados.get('email'))
    senha = dados.get('senha') or ''

    if not nome or not email or not senha:
        return jsonify({'erro': 'Nome, email e senha são obrigatórios'}), 400

    conn = get_connection()
    try:
        existente = conn.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            (email,),
        ).fetchone()

        if existente is not None:
            return jsonify({'erro': 'Email já cadastrado'}), 400

        senha_hash = generate_password_hash(senha)
        cursor = conn.execute(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            (nome, email, senha_hash),
        )
        conn.commit()

        return jsonify({
            'sucesso': True,
            'mensagem': 'Usuário criado com sucesso',
            'usuario_id': cursor.lastrowid,
        }), 201
    finally:
        conn.close()


@app.route('/login', methods=['POST'])
def login():
    dados = request.get_json(silent=True) or {}
    email = normalizar_email(dados.get('email'))
    senha = dados.get('senha') or ''

    if not email or not senha:
        return jsonify({'erro': 'Email e senha são obrigatórios'}), 400

    conn = get_connection()
    try:
        usuario = conn.execute(
            'SELECT id, senha FROM usuarios WHERE email = ?',
            (email,),
        ).fetchone()

        if usuario is None or not check_password_hash(usuario['senha'], senha):
            return jsonify({'erro': 'Credenciais inválidas'}), 401

        token = criar_token(usuario['id'])
        return jsonify({'sucesso': True, 'token': token, 'usuario_id': usuario['id']}), 200
    finally:
        conn.close()


@app.route('/refeicoes', methods=['POST'])
@token_required
def criar_refeicao(usuario_id):
    dados = request.get_json(silent=True) or {}
    tipo = (dados.get('tipo') or '').strip()
    alimentos = (dados.get('alimentos') or '').strip()

    if not tipo or not alimentos:
        return jsonify({'erro': 'Tipo e alimentos são obrigatórios'}), 400

    conn = get_connection()
    try:
        xp_ganho = calcular_xp_refeicao(alimentos)
        data_refeicao = dados.get('data_refeicao') or datetime.now().isoformat()

        cursor = conn.execute(
            '''
            INSERT INTO refeicoes (usuario_id, tipo, alimentos, calorias, xp_ganho, data_refeicao)
            VALUES (?, ?, ?, ?, ?, ?)
            ''',
            (usuario_id, tipo, alimentos, dados.get('calorias') or 0, xp_ganho, data_refeicao),
        )
        conn.execute(
            'UPDATE usuarios SET xp = xp + ? WHERE id = ?',
            (xp_ganho, usuario_id),
        )
        conn.execute(
            '''
            INSERT INTO historico_xp (usuario_id, tipo, xp_ganho, referencia_id, data_evento)
            VALUES (?, ?, ?, ?, ?)
            ''',
            (usuario_id, 'refeição', xp_ganho, cursor.lastrowid, datetime.now().isoformat()),
        )
        conn.commit()
        atualizar_nivel(usuario_id, conn)

        return jsonify({
            'sucesso': True,
            'mensagem': f'Refeição registrada! +{xp_ganho} XP',
            'refeicao_id': cursor.lastrowid,
        }), 201
    finally:
        conn.close()


@app.route('/refeicoes/<int:refeicao_id>', methods=['DELETE'])
@token_required
def deletar_refeicao(usuario_id, refeicao_id):
    conn = get_connection()
    try:
        refeicao = conn.execute(
            'SELECT xp_ganho FROM refeicoes WHERE id = ? AND usuario_id = ?',
            (refeicao_id, usuario_id),
        ).fetchone()

        if refeicao is None:
            return jsonify({'erro': 'Refeição não encontrada'}), 404

        conn.execute('UPDATE usuarios SET xp = xp - ? WHERE id = ?', (refeicao['xp_ganho'], usuario_id))
        conn.execute('DELETE FROM refeicoes WHERE id = ?', (refeicao_id,))
        conn.commit()
        atualizar_nivel(usuario_id, conn)

        return jsonify({'sucesso': True, 'mensagem': 'Refeição removida'}), 200
    finally:
        conn.close()


@app.route('/exercicios', methods=['POST'])
@token_required
def criar_exercicio(usuario_id):
    dados = request.get_json(silent=True) or {}
    tipo = (dados.get('tipo') or '').strip()
    duracao = dados.get('duracao_minutos')

    if not tipo or duracao is None:
        return jsonify({'erro': 'Tipo e duração são obrigatórios'}), 400

    conn = get_connection()
    try:
        xp_ganho = calcular_xp_exercicio(tipo, duracao)
        data_exercicio = dados.get('data_exercicio') or datetime.now().isoformat()

        cursor = conn.execute(
            '''
            INSERT INTO exercicios (usuario_id, tipo, duracao_minutos, xp_ganho, data_exercicio)
            VALUES (?, ?, ?, ?, ?)
            ''',
            (usuario_id, tipo, int(duracao), xp_ganho, data_exercicio),
        )
        conn.execute(
            'UPDATE usuarios SET xp = xp + ? WHERE id = ?',
            (xp_ganho, usuario_id),
        )
        conn.execute(
            '''
            INSERT INTO historico_xp (usuario_id, tipo, xp_ganho, referencia_id, data_evento)
            VALUES (?, ?, ?, ?, ?)
            ''',
            (usuario_id, 'exercício', xp_ganho, cursor.lastrowid, datetime.now().isoformat()),
        )
        conn.commit()
        atualizar_nivel(usuario_id, conn)

        return jsonify({
            'sucesso': True,
            'mensagem': f'Exercício registrado! +{xp_ganho} XP',
            'exercicio_id': cursor.lastrowid,
        }), 201
    finally:
        conn.close()


@app.route('/exercicios/<int:exercicio_id>', methods=['DELETE'])
@token_required
def deletar_exercicio(usuario_id, exercicio_id):
    conn = get_connection()
    try:
        exercicio = conn.execute(
            'SELECT xp_ganho FROM exercicios WHERE id = ? AND usuario_id = ?',
            (exercicio_id, usuario_id),
        ).fetchone()

        if exercicio is None:
            return jsonify({'erro': 'Exercício não encontrado'}), 404

        conn.execute('UPDATE usuarios SET xp = xp - ? WHERE id = ?', (exercicio['xp_ganho'], usuario_id))
        conn.execute('DELETE FROM exercicios WHERE id = ?', (exercicio_id,))
        conn.commit()
        atualizar_nivel(usuario_id, conn)

        return jsonify({'sucesso': True, 'mensagem': 'Exercício removido'}), 200
    finally:
        conn.close()


@app.route('/ranking', methods=['GET'])
def ranking():
    limite = request.args.get('limite', default=10, type=int)
    conn = get_connection()
    try:
        ranking = conn.execute(
            'SELECT id, nome, xp, nivel FROM usuarios ORDER BY xp DESC LIMIT ?',
            (limite,),
        ).fetchall()

        resultado = [dict(usuario) for usuario in ranking]
        for index, usuario in enumerate(resultado, start=1):
            usuario['posicao'] = index

        return jsonify({'sucesso': True, 'total': len(resultado), 'ranking': resultado}), 200
    finally:
        conn.close()


if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
