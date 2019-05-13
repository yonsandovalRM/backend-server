// Requires
var express = require('express');
const path = require('path');
const fs = require('fs');


// Inicializar variables
var app = express();

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen)
    } else {
        var pathNoImage = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImage);
    }
});
module.exports = app;