CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(100),
  tipo VARCHAR(20),
  disponivel BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS corridas (
  id SERIAL PRIMARY KEY,
  passageiro_id INTEGER REFERENCES usuarios(id),
  motorista_id INTEGER REFERENCES usuarios(id),
  origem VARCHAR(255) NOT NULL,
  destino VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'request',
  valor NUMERIC(10,2),
  distancia_km NUMERIC(10,2),
  duracao_min NUMERIC(10,2),
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  origem_lat NUMERIC(10,6),
  origem_lng NUMERIC(10,6),
  destino_lat NUMERIC(10,6),
  destino_lng NUMERIC(10,6)
);

CREATE TABLE IF NOT EXISTS fila_corridas (
  id SERIAL PRIMARY KEY,
  corrida_id INTEGER REFERENCES corridas(id),
  motivo TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);