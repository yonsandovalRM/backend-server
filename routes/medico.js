// Requires
var express = require('express');
var Medico = require('../models/medico');

var mwAutenticacion = require('../middlewares/autenticacion');


// Inicializar variables
var app = express();



//  =======================================
//  Obtener todos los medicos
//  =======================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        medicos: medicos
                    });
                });
            });
});






//  =======================================
//  Actualizar medico
//  =======================================
app.put('/:id', mwAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }


        medico.name = body.name;
        medico.user = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });



    });

});



//  =======================================
//  Crear nuevo medico
//  =======================================
app.post('/', mwAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        name: body.name,
        user: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});




//  =======================================
//  Borrar un medico por el id
//  =======================================
app.delete('/:id', mwAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});


module.exports = app;