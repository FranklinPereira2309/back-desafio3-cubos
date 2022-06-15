DROP TABLE IF EXISTS usuarios;

DROP TABLE IF EXISTS categorias;

DROP TABLE IF EXISTS transacoes;

CREATE TABLE usuarios(
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email  TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL 
);

CREATE TABLE categorias(
    id SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL

);

CREATE TABLE transacoes(
    id SERIAL PRIMARY KEY,
    descricao TEXT NOT NULL,
    valor INTEGER NOT NULL,
    data timestamptz DEFAULT NOW(),
    categoria_id INT REFERENCES categorias(id),
    usuario_id INT REFERENCES usuarios(id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN('entrada', 'saida'))
    
);

INSERT INTO categorias(descricao) 
VALUES
('alimentação'),
('educação'),
('salário'),
('saúde'),
('lazer'),
('casa'),
('assinaturas e serviços'),
('outras receitas'),    
('outras despesas');
