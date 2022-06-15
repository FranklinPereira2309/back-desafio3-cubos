const conexao = require('../bancoDeDados/conexao');
const yup = require('yup');

const { pt } = require('yup-locales');




const listarTransacaoUsuario = async (req, res) => {

    const { usuario } = req;

    try {

        const { rowCount, rows } = await conexao.query('select * from transacoes where usuario_id = $1 ', [usuario.id]);

        if (rowCount === 0) {
            return res.status(400).json(rows[0]);
        }

        const arrayTransacoes = rows;


        return res.status(200).json(arrayTransacoes);

    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }

}

const detalharTransacaoUsuario = async (req, res) => {
    const { id: userId } = req.params;
    const { usuario } = req;

    try {

        const { rowCount: existeUsuario } = await conexao.query('select * from transacoes where usuario_id = $1', [usuario.id]);

        if (existeUsuario === 0) {
            return res.status(400).json({ mensagem: 'Essa transação não pertence a este usuário ou não há transações.' });
        }

        if (isNaN(userId)) {
            return res.status(404).json({ mensagem: 'Deve ser digitado um número de ID válido.' });
        }

        const detalharTransacao = 
        `select 
        transacoes.id, 
        transacoes.tipo, 
        transacoes.descricao, 
        transacoes.valor, 
        transacoes.data, 
        transacoes.usuario_id, 
        transacoes.categoria_id, 
        categorias.descricao as categoria_nome 
        from 
        transacoes 
        left join categorias on categorias.id = transacoes.categoria_id
        left join usuarios on usuarios.id = transacoes.usuario_id 
        where 
        transacoes.id = $1 
        and transacoes.usuario_id = $2`;

        const { rows, rowCount } = await conexao.query(detalharTransacao, [userId, usuario.id]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Essa transação não pertence a este usuário ou não há transações.' })
        }

        const arrayTransacoes = rows;

        return res.status(200).json(arrayTransacoes);

    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }

}

const cadastrarTransacaoUsuario = async (req, res) => {

    const { descricao, valor, categoria_id, tipo } = req.body;

    const { usuario } = req;

    const { rowCount: validarCategoria } = await conexao.query('select * from categorias where id = $1', [categoria_id]);

    if (validarCategoria === 0) {
        return res.status(400).json({ mensagem: 'A categoria digitada não está cadastrada.' });
    }

    try {
        yup.setLocale(pt);
        
        const schema = yup.object().shape({
            descricao: yup.string().required(),
            valor: yup.number().required()
        });

        await schema.validate(req.body);

        const { rowCount: usuarioLogado } = await conexao.query('select * from usuarios where id = $1', [usuario.id]);

        if (usuarioLogado === 0) {
            return res.status(400).json({ mensagem: 'O usuário não está cadastrado' });
        }

        const queryCriarTransacao = 'insert into transacoes(descricao, valor, categoria_id, usuario_id, tipo) values($1, $2, $3, $4, $5)';

        const { rowCount: novaTransacao } = await conexao.query(queryCriarTransacao, [descricao, valor, categoria_id, usuario.id, tipo]);

        if (novaTransacao === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível realizar a Transação.' });
        }

        const queryEncontrarTransacao = 
        `select 
        transacoes.id, 
        transacoes.tipo, 
        transacoes.descricao, 
        transacoes.valor, 
        transacoes.data, 
        transacoes.usuario_id, 
        transacoes.categoria_id, 
        categorias.descricao as categoria_nome 
        from 
        transacoes 
        left join categorias on categorias.id = transacoes.categoria_id
        order by 
        transacoes.id desc`;

        const { rows: resultadoEncontrado } = await conexao.query(queryEncontrarTransacao);



        return res.status(201).json(resultadoEncontrado[0]);

    } catch (error) {

        return res.status(500).json(error.message);
    }

}

const filtrarTransacoesPorCategoria = async (req, res) => {

    const { filtro } = req.query;

    const { usuario } = req;

    try {

        const { rowCount: existeUsuario } = await conexao.query('select * from transacoes where usuario_id = $1', [usuario.id]);

        if (existeUsuario === 0) {
            return res.status(400).json({ mensagem: 'Essa transação não pertence a este usuário ou não há transações.' });
        }

        const { row, rowCount } = await conexao.query('select * from transacoes join categorias on categorias.id = transacoes.categoria_id where categorias.descricao ilike %$1%', [filtro]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Categoria não localizada.' })
        }

        return res.status(201).json(row);


    } catch (error) {
        return res.status(400).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }

}


const atualizarTransacaoUsuario = async (req, res) => {

    const idTransacao = Number(req.params.id);

    const { usuario } = req;

    const { descricao, valor, categoria_id, tipo } = req.body;

    const erro = verificarBodyTransacao(req.body);

    if (erro) {
        return res.status(400).json({ mensagem: erro });
    }

    if (isNaN(idTransacao)) {
        return res.status(400).json({ mensagem: 'Deve ser digitado um número de ID válido.' });
    }

    try {

        const queryValidarAutor = 'select * from transacoes where id = $1 and usuario_id = $2';

        const { rowCount: validar } = await conexao.query(queryValidarAutor, [idTransacao, usuario.id])

        if (validar === 0) {
            return res.status(401).json({ mensagem: 'Esta transação não está autorizada para este usuário.' });
        }

        const { rowCount: validarCategoria } = await conexao.query('select * from categorias where id = $1', [categoria_id]);

        if (validarCategoria === 0) {
            return res.status(400).json({ mensagem: 'A categoria digitada não está cadastrada.' });
        }

        const queryAtualizar = 'update transacoes set descricao = $1 , valor = $2, categoria_id = $3, usuario_id = $4, tipo = $5 where id = $6 and usuario_id = $7';

        const { rowCount } = await conexao.query(queryAtualizar, [descricao, valor, categoria_id, usuario.id, tipo, idTransacao, usuario.id]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível atualizar a Transação.' });
        }

        return res.status(204).json();

    } catch (error) {

        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }

}

const deletarTransacaoUsuario = async (req, res) => {

    const idTransacao = Number(req.params.id);

    const { usuario } = req;


    if (isNaN(idTransacao)) {
        return res.status(401).json({ mensagem: 'Deve ser digitado um número de ID válido.' });
    }

    try {

        const { rowCount: localizarTransacao } = await conexao.query('select * from transacoes where usuario_id = $1 and id = $2', [usuario.id, idTransacao]);

        if (localizarTransacao === 0) {
            return res.status(400).json({ mensagem: 'O Id da transação não foi encontrado ou não há transações para este usuário.' });
        }

        const queryValidarAutor = 'select * from transacoes where id = $1 and usuario_id = $2';

        const { rowCount: validar } = await conexao.query(queryValidarAutor, [idTransacao, usuario.id])

        if (validar === 0) {
            return res.status(401).json({ mensagem: 'Esta transação não exite para o usuário.' });
        }

        const queryDeletar = 'delete from transacoes where id = $1 and usuario_id = $2';

        const { rowCount } = await conexao.query(queryDeletar, [idTransacao, usuario.id]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível excluir a Transação.' });
        }

        return res.status(201).json();

    } catch (error) {

        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }
}

const extratoDeTransacoes = async (req, res) => {

    const { usuario } = req;


    try {

        const queryExisteUsuario = 'select * from transacoes where usuario_id = $1';

        const { rowCount: validaUsuario } = await conexao.query(queryExisteUsuario, [usuario.id]);

        if (validaUsuario === 0) {
            return res.status(404).json(
                {
                    'entrada': 0,
                    'saida': 0
                });
        }

        const queryHaEntrada = "select tipo, sum(valor) as entrada from transacoes where tipo = 'entrada' and usuario_id = $1 group by tipo";
        const { rows: resultadoEntrada, rowCount: validaEntrada } = await conexao.query(queryHaEntrada, [usuario.id]);

        const queryHaSaida = "select tipo, sum(valor) as saida from transacoes where tipo = 'saida' and usuario_id = $1 group by tipo";
        const { rows: resultadoSaida, rowCount: validaSaida } = await conexao.query(queryHaSaida, [usuario.id]);

        let { tipo: tipoEntrada, ...entrada } = resultadoEntrada[0] ? resultadoEntrada[0] : { tipo: 1, entrada: 0 }
        let { tipo: tipoSaida, ...saida } = resultadoSaida[0] ? resultadoSaida[0] : { tipo: 0, saida: 0 }
        let extrato = {};
        let extratoUnificado = {};

        if (resultadoEntrada && resultadoSaida) {

            extrato = { ...entrada, ...saida }

            extratoUnificado = { "entrada": parseInt(extrato.entrada), "saida": parseInt(extrato.saida) }
        }

        if (!resultadoEntrada && resultadoSaida) {

            extrato = { entrada, ...saida };
            extratoUnificado = { "entrada": entrada, "saida": parseInt(extrato.saida) }
        }

        if (resultadoEntrada && !resultadoSaida) {

            extrato = { ...entrada, saida }
            extratoUnificado = { "entrada": parseInt(extrato.entrada), "saida": saida }
        }

        return res.status(201).json(extratoUnificado);

    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }

}

module.exports = {
    listarTransacaoUsuario,
    detalharTransacaoUsuario,
    cadastrarTransacaoUsuario,
    filtrarTransacoesPorCategoria,
    atualizarTransacaoUsuario,
    deletarTransacaoUsuario,
    extratoDeTransacoes
}