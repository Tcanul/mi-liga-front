const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['admin', 'liga_owner', 'capitan'], 
    required: true 
  },
  ligaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Liga', default: null }, // Para usuarios de liga
  equipoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipo', default: null } // Para capitanes
});

module.exports = mongoose.model('User', userSchema);