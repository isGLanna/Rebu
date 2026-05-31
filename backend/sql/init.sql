CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(100),
  tipo VARCHAR(20),
  disponivel BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS corridas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passageiro_id UUID REFERENCES usuarios(id),
  motorista_id UUID REFERENCES usuarios(id),

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corrida_id UUID REFERENCES corridas(id),
  motivo TEXT,
  tipo_fila VARCHAR(20) DEFAULT 'entrada',
  status VARCHAR(50) DEFAULT 'aguardando_processamento',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fila_entrada_corridas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corrida_id UUID REFERENCES corridas(id),
  origem_service_id VARCHAR(100),
  motivo TEXT,
  status VARCHAR(50) DEFAULT 'aguardando_processamento',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fila_saida_corridas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corrida_id UUID REFERENCES corridas(id),
  destino_service_id VARCHAR(100),
  motivo TEXT,
  status VARCHAR(50) DEFAULT 'aguardando_delegacao',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);