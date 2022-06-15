const express = require('express');
const usuarios = require('./controladores/usuarios');
const login = require('./controladores/login');
const { verificarLogin } = require('./intermediarios/verificarLogin');
const categoria = require('./controladores/categoria');
const transacao = require('./controladores/transacao');


const rotas = express();

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', login.login);

rotas.use(verificarLogin);

rotas.get('/usuario', usuarios.consultarUsuario);
rotas.put('/usuario', usuarios.atualizarUsuario);

rotas.get('/categoria', categoria.listarCategoriasUsuario);
rotas.get('/transacao', transacao.listarTransacaoUsuario);
rotas.get('/transacao/extrato', transacao.extratoDeTransacoes);
rotas.get('/transacao/:id', transacao.detalharTransacaoUsuario);
rotas.post('/transacao', transacao.cadastrarTransacaoUsuario);
rotas.get('/transacao', transacao.filtrarTransacoesPorCategoria);
rotas.put('/transacao/:id', transacao.atualizarTransacaoUsuario);
rotas.delete('/transacao/:id', transacao.deletarTransacaoUsuario);

module.exports = rotas

