const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const yup = require('yup');
const { setLocale } = require('yup')
const { pt, da } = require('yup-locales');


const cadastrarLogin = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        setLocale(pt);
        const schema = yup.object().shape({
            nome: yup.string().required(),
            email: yup.string().email().required(),
            senha: yup.string().required().min(5)
        });

        await schema.validate(req.body);

        const { rowCount: existeEmail } = await conexao.query('select * from usuarios where email = $1', [email]);

        if (existeEmail > 0) {
            return res.status(404).json({ mensagem: 'O EMAIL cadastrado já existe.' });
        }

        const senhaEncriptada = await bcrypt.hash(senha, 10);

        const queryCriarUsuario = 'insert into usuarios(nome, email, senha) values($1, $2, $3)';

        const { rows, rowCount } = await conexao.query(queryCriarUsuario, [nome, email, senhaEncriptada]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível criar o  USUÁRIO.' });
        }

        const { rows: usuario } = await conexao.query('select * from usuarios where email = $1', [email]);

        const { senha: senhaUsuario, ...dadosUsuario } = usuario[0];

        return res.status(201).json(dadosUsuario);


    } catch (error) {
        return res.status(500).json({ mensagem: `${erro.message}` });
    }
}

const consultarLogin = async (req, res) => {
    const { usuario } = req;
    try {

        if (!usuario) {
            return res.status(401).json({ mensagem: 'O usuário não foi encotrado, você precisa está autenticado!' });
        }

        const { senha, ...usuarioAtual } = usuario;

        return res.status(200).json(usuarioAtual);

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}

const consultarGeralLogin = async (req, res) => {
    
    try {

        const queryUsuarios = `select * from usuarios`;
        
        const { rows, rowCount } = await conexao.query(queryUsuarios);

        if(rowCount === 0) {
            return res.status(404).json({mensagem: 'Usuários não encontrados!'});
        }
        
        const usuariosSemSenha = rows.map(usuario => {
            const {senha, ... usuario_sem_senha} = usuario;
            return usuario_sem_senha;
        })
        
        return res.status(200).json(usuariosSemSenha);

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}` });
    }

}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { usuario } = req;

    try {
        setLocale(pt);
        const schema = yup.object().shape({
            nome: yup.string(),
            email: yup.string().email(),
            senha: yup.string().min(5)
        });

        await schema.validate(req.body);

        if (email !== usuario.email) {

            const { rowCount: existeEmail } = await conexao.query('select * from usuarios where email = $1', [email]);

            if (existeEmail > 0) {
                return res.status(404).json({ mensagem: 'O EMAIL cadastrado já existe.' });
            }
        }

        const senhaEncriptada = await bcrypt.hash(senha, 10);

        const queryCriarUsuario = 'update usuarios set nome = $1, email = $2, senha = $3 where id = $4';

        const { rows, rowCount } = await conexao.query(queryCriarUsuario, [nome, email, senhaEncriptada, usuario.id]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não foi possível atualizar o USUÁRIO.' });
        }

        return res.status(204).json();

    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }
}

const deletarUsuario = async (req, res) => {
    const idUsuario = req.params.id;
    
    try {
        const queryUsuario = `select * from usuarios where id = $1`;

        const { rowCount } = await conexao.query(queryUsuario, [idUsuario]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Usuário não encontrado!'});
        }

        const excluirUsuario = `delete from usuarios where id = $1`;

        const { rowCount: usuarioExcluido } = await conexao.query(excluirUsuario, [idUsuario]);

        if(usuarioExcluido === 0) {
            return res.status(404).json({mensagem: 'Não foi possível excluir o Usuário!'});
        }

        return res.status(201).json({mensagem: 'Usuário Excluído com Sucesso!'});

    } catch (error) {
        return res.status(500).json({ mensagem: `${error.message}`});
    }
}



module.exports = {
    cadastrarLogin,
    consultarLogin,
    consultarGeralLogin,
    atualizarUsuario,
    deletarUsuario
}