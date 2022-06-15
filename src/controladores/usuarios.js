const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const yup = require('yup');
const { setLocale } = require('yup')
const { pt } = require('yup-locales');


const cadastrarUsuario = async (req, res) => {
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
        return res.status(500).json(error.message);
    }
}

const consultarUsuario = async (req, res) => {
    const { usuario } = req;

    try {

        if (!usuario) {
            return res.status(401).json({ mensagem: 'O usuário não foi encotrado, você precisa está autenticado!' });
        }

        const { senha, ...usuarioAtual } = rows[0];

        return res.status(200).json(usuarioAtual);

    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }

}

const atualizarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { usuario } = req;

    const erro = verificarBodyUsuario(req.body);

    if (erro) {
        return res.status(400).json({ mensagem: erro });
    }

    try {

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



module.exports = {
    cadastrarUsuario,
    consultarUsuario,
    atualizarUsuario
}