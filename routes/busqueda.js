// Requires
var express = require('express');

// Importaciones de modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();



//  =======================================
//  Búsqueda específica
//  =======================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var tabla = req.params.tabla;
    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda son solo: Usuarios, médicos y hospitales',
                error: { mensaje: 'Tipo de colección no válida' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });


});




//  =======================================
//  Búsqueda general
//  =======================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            mensaje: 'Petición enviada correctamente',
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

});

function buscarHospitales(regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ name: regex })
            .populate('user', 'name email').exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ name: regex }).populate('user', 'name email').populate('hospital').exec((err, medicos) => {
            if (err) {
                reject('Error al cargar medicos', err);
            } else {
                resolve(medicos);
            }
        });
    });

}

function buscarUsuarios(regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'name email').or([{ 'name': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}
module.exports = app;