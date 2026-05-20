CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(100),
  tipo VARCHAR(20)
);

CREATE TABLE veiculos (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  motorista_id UUID REFERENCES usuarios(id),
  modelo VARCHAR(50),
  placa VARCHAR(10) UNIQUE,
  cor VARCHAR(20)
);

CREATE TABLE corridas (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  passageiro_id UUID REFERENCES usuarios(id),
  motorista_id UUID REFERENCES usuarios(id),
  origem VARCHAR(255) NOT NULL,
  destino VARCHAR(255) NOT NULL,
  distancia_km NUMERIC(10,2),
  duracao_min NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'pendente',
  valor NUMERIC(10,2),
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  corrida_id UUID REFERENCES corridas(id),
  passageiro_id UUID REFERENCES usuarios(id),
  valor NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pago',
  metodo VARCHAR(50),
  data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);