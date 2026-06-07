const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

class UsuarioController {

  async listar(req, res) {
    try {

      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          ativo: true,
          createdAt: true
        }
      });

      return res.json(usuarios);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {

      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: {
          id: Number(id)
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          ativo: true,
          createdAt: true
        }
      });

      if (!usuario) {
        return res.status(404).json({
          erro: "Usuário não encontrado"
        });
      }

      return res.json(usuario);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async criar(req, res) {
    try {

      const {
        nome,
        email,
        senha,
        perfil
      } = req.body;

      const usuarioExistente = await prisma.usuario.findUnique({
        where: {
          email
        }
      });

      if (usuarioExistente) {
        return res.status(400).json({
          erro: "E-mail já cadastrado"
        });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          perfil
        }
      });

      return res.status(201).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

async atualizar(req, res) {
  try {
    const { id } = req.params;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: Number(id) }
    });

    if (!usuarioExiste) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const { nome, email, perfil, ativo } = req.body;

    // verifica email duplicado (se mudou)
    if (email && email !== usuarioExiste.email) {
      const emailExiste = await prisma.usuario.findUnique({
        where: { email }
      });

      if (emailExiste) {
        return res.status(400).json({ erro: "E-mail já está em uso" });
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nome: nome ?? usuarioExiste.nome,
        email: email ?? usuarioExiste.email,
        perfil: perfil ?? usuarioExiste.perfil,
        ativo: ativo ?? usuarioExiste.ativo
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
        createdAt: true
      }
    });

    return res.json(usuario);

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

  async excluir(req, res) {
    try {

      const { id } = req.params;

      await prisma.usuario.delete({
        where: {
          id: Number(id)
        }
      });

      return res.json({
        mensagem: "Usuário removido com sucesso"
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports = new UsuarioController();