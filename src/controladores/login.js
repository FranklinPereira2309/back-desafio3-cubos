const conexao = require('../bancoDeDados/conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const segredo = require('../segredo');

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(404).json({ mensagem: 'EMAIL e/ou SENHA são obrigatórios!' });
    }

    try {
        const { rows, rowCount: existeEmail } = await conexao.query('select * from usuarios where email = $1', [email]);

        if (existeEmail === 0) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado!' });
        }

        const usuarioEncontrado = rows[0];


        const senhaVerificada = await bcrypt.compare(senha, usuarioEncontrado.senha)

        if (!senhaVerificada) {
            return res.status(404).json({ mensagem: 'EMAIL e/ou SENHA não conferem' });
        }


        const token = jwt.sign({ id: usuarioEncontrado.id }, segredo, { expiresIn: '1h' });

        const { senha: senhaUsuario, ...usuario } = usuarioEncontrado

        return res.status(200).json({
            usuario,
            token
        });


    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }
}

module.exports = {
    login
}