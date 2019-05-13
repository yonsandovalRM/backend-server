// Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// Inicializar variables
var app = express();

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);



// ==========================================
//  Autenticación De Google
// ==========================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal',
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.name = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            })
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!',
    //     googleUser
    // });

});

// verify().catch(console.error);

// app.post('/google', (req, res) => {

//     var token = req.body.token || 'XXX';


//     var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

//     client.verifyIdToken(
//         token,
//         GOOGLE_CLIENT_ID,
//         // Or, if multiple clients access the backend:
//         //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
//         function(e, login) {

//             if (e) {
//                 return res.status(400).json({
//                     ok: true,
//                     mensaje: 'Token no válido',
//                     errors: e
//                 });
//             }


//             var payload = login.getPayload();
//             var userid = payload['sub'];
//             // If request specified a G Suite domain:
//             //var domain = payload['hd'];

//             Usuario.findOne({ email: payload.email }, (err, usuario) => {

//                 if (err) {
//                     return res.status(500).json({
//                         ok: true,
//                         mensaje: 'Error al buscar usuario - login',
//                         errors: err
//                     });
//                 }

//                 if (usuario) {

//                     if (usuario.google === false) {
//                         return res.status(400).json({
//                             ok: true,
//                             mensaje: 'Debe de usar su autenticación normal'
//                         });
//                     } else {

//                         usuario.password = ':)';

//                         var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

//                         res.status(200).json({
//                             ok: true,
//                             usuario: usuario,
//                             token: token,
//                             id: usuario._id
//                         });

//                     }

//                     // Si el usuario no existe por correo
//                 } else {

//                     var usuario = new Usuario();


//                     usuario.nombre = payload.name;
//                     usuario.email = payload.email;
//                     usuario.password = ':)';
//                     usuario.img = payload.picture;
//                     usuario.google = true;

//                     usuario.save((err, usuarioDB) => {

//                         if (err) {
//                             return res.status(500).json({
//                                 ok: true,
//                                 mensaje: 'Error al crear usuario - google',
//                                 errors: err
//                             });
//                         }


//                         var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

//                         res.status(200).json({
//                             ok: true,
//                             usuario: usuarioDB,
//                             token: token,
//                             id: usuarioDB._id
//                         });

//                     });

//                 }


//             });


//         });
// });

// ==========================================
//  Autenticación normal
// ==========================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear TOKEN
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });

});



module.exports = app;