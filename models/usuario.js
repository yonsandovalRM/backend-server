var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioShcema = new Schema({
    name: { type: String, required: [true, 'EL nombre es requerido'] },
    email: { type: String, required: [true, 'El correo es requerido'], unique: true },
    password: { type: String, required: [true, 'La contraseña es requerida'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }

});

usuarioShcema.plugin(uniqueValidator, { message: 'Este {PATH} ya está en uso' });

module.exports = mongoose.model('Usuario', usuarioShcema);