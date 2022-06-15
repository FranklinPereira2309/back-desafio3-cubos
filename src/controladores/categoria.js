const conexao = require('../bancoDeDados/conexao');

const listarCategoriasUsuario = async (req, res) => {

    const { usuario } = req;

    try {

        const categorias = 'select * from categorias order by id';

        const { rows, rowCount } = await conexao.query(categorias);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: 'Não há categorias cadastradas.' })
        }

        return res.status(200).json(rows);

    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro desconhecido. - ' + error.message });
    }

}

module.exports = {
    listarCategoriasUsuario
}