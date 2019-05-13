// Requires
var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// Inicializar variables
var app = express();


// default options Middleware
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No selecciono ningún archivo',
            errors: { message: 'debe seleccionar un archivo' }
        });
    }

    // Obtener archivo
    var archivo = req.files.image;
    // Obtener nombre del archivo
    var nombreOriginalArchivo = archivo.name.split('.');
    // Obtener extensión del archivo
    var extensionArchivo = nombreOriginalArchivo[nombreOriginalArchivo.length - 1];

    // Extensiones aceptadas
    var extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];
    // tipos aceptados
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida: ' + tiposValidos.join(', ') }
        });
    }

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'debe seleccionar un archivo: ' + extensionesValidas.join(', ') }
        });
    }

    // Renombrar archivo
    var nombreArchivo = `${ id }-${new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover archivo a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;



    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario no existe',
                    errors: { message: 'El usuario no existe' }
                });
            }
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error al encontrar usuario',
                    errors: err
                });
            }

            var oldPath = './uploads/usuarios/' + usuario.img;



            // Si existe elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }


            usuario.img = nombreArchivo;


            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al actualizar usuario',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico no existe',
                    errors: { message: 'El medico no existe' }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error al encontrar medico',
                    errors: err
                });
            }

            var oldPath = './uploads/medicos/' + medico.img;



            // Si existe elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }


            medico.img = nombreArchivo;


            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al actualizar medico',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital no existe',
                    errors: { message: 'El hospital no existe' }
                });
            }
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error al encontrar hospital',
                    errors: err
                });
            }

            var oldPath = './uploads/hospitales/' + hospital.img;



            // Si existe elimina la imagen anterior
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }


            hospital.img = nombreArchivo;


            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error al actualizar hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado
                });
            });
        });
    }
}
module.exports = app;