const express = require('express');
const usuarios = require('./controladores/usuarios');
const login = require('./controladores/login');
const { verificarLogin } = require('./intermediarios/verificarLogin');

const rotas = express();

rotas.post('/cadastrar_login', usuarios.cadastrarLogin);
rotas.post('/login', login.login);
rotas.get('/consultar_geral_login', usuarios.consultarGeralLogin);

rotas.use(verificarLogin);

rotas.get('/consultar_login', usuarios.consultarLogin);
rotas.post('/atualizar_login', usuarios.atualizarUsuario);
rotas.delete('/deletar_login/:id', usuarios.deletarUsuario);

module.exports = rotas

