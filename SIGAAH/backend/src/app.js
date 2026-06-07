const express = require('express');
const cors = require('cors');

const abrigoRoutes = require('./routes/abrigo.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/abrigos', abrigoRoutes);
app.use('/usuarios', usuarioRoutes);

module.exports = app;