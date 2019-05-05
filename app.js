// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexión a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('DB: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(403).json({
        ok: true,
        mensaje: 'Petición enviada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express corriendo en 3000: \x1b[32m%s\x1b[0m', 'online');
});