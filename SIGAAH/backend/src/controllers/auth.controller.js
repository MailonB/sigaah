const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {

  async login(req, res) {
    try {

      const { email, senha } = req.body;

      const usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario) {
        return res.status(401).json({
          erro: 'E-mail ou senha inválidos'
        });
      }

      if (!usuario.ativo) {
        return res.status(401).json({
          erro: 'Usuário desativado'
        });
      }

      const senhaValida = await bcrypt.compare(
        senha,
        usuario.senha
      );

      if (!senhaValida) {
        return res.status(401).json({
          erro: 'E-mail ou senha inválidos'
        });
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          nome: usuario.nome,
          perfil: usuario.perfil
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '8h'
        }
      );

      return res.json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        },
        token
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports = new AuthController();