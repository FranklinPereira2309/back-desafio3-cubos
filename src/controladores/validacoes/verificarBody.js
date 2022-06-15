const { setLocale } = require('yup');
const { pt } = require('yup-locales')

const verificarBodyUsuario = (usuario) => {
    const { nome, email, senha } = usuario;

    try {

        const schema = yup.object().shape({
            nome: yup.string().required(),
            email: yup.string().email().required(),
            senha: yup.string().required().min(5)
        });

        setLocale(pt);
        schema.validate(usuario)
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const verificarBodyTransacao = (bodyTransacao) => {
    const { descricao, valor, categoria_id, tipo } = bodyTransacao;

    if (!descricao) {
        return "O campo descrição é obrigatório";
    }

    if (!valor) {
        return "O campo valor é obrigatório";
    }

    if (!categoria_id) {
        return "O campo Id da categoria é obrigatório";
    }

    if (!tipo) {
        return "O campo tipo é obrigatório";
    }

    if (tipo !== 'saida' && tipo !== 'entrada') {
        return "Somente é permitido o tipo: entrada ou saida."
    }

}

module.exports = {
    verificarBodyUsuario,
    verificarBodyTransacao
}