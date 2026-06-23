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
        return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
      }

      if (!usuario.ativo) {
        return res.status(401).json({ erro: 'Usuário desativado' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
      }

      const token = jwt.sign(
        {
          id: usuario.id,
          nome: usuario.nome,
          perfil: usuario.perfil
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
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
      return res.status(500).json({ erro: error.message });
    }
  }

  async register(req, res) {
    try {
      const { nome, email, senha, perfil } = req.body;

      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      });

      if (usuarioExistente) {
        return res.status(400).json({ erro: 'E-mail já cadastrado' });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          perfil: perfil || 'ADMIN'
        }
      });

      return res.status(201).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      });

    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
}

module.exports = new AuthController();
