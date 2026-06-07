function permitir(...perfis) {
  return (req, res, next) => {

    if (!perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({
        erro: 'Acesso negado'
      });
    }

    next();
  };
}

module.exports = permitir;