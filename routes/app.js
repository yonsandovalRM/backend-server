// Requires
var express = require('express');

// Inicializar variables
var app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición enviada correctamente'
    });
});
module.exports = app;