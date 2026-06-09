const express = require('express');
const cors = require('cors');

const abrigoRoutes = require('./routes/abrigo.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const authRoutes = require('./routes/auth.routes');
const pessoaAcolhidaRoutes = require('./routes/pessoaAcolhida.routes');
const necessidadeEspecialRoutes =
  require('./routes/necessidadeEspecial.routes');
  const voluntarioRoutes =
  require('./routes/voluntario.routes');
  const solicitacaoAjudaRoutes =
  require('./routes/solicitacaoAjuda.routes');
  const itemEstoqueRoutes =
  require('./routes/itemEstoque.routes');
  const movimentacaoEstoqueRoutes =
  require('./routes/movimentacaoEstoque.routes');
  const dashboardRoutes =
  require('./routes/dashboard.routes');
  const relatorioRoutes = require('./routes/relatorio.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/abrigos', abrigoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/pessoas-acolhidas', pessoaAcolhidaRoutes);
app.use('/necessidades-especiais', necessidadeEspecialRoutes);
app.use('/voluntarios', voluntarioRoutes);
app.use('/solicitacoes', solicitacaoAjudaRoutes);
app.use('/estoque', itemEstoqueRoutes);
app.use('/estoque', movimentacaoEstoqueRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/relatorios', relatorioRoutes);

module.exports = app;