const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = 'Torneo_Kanasin'; // Usa variables de entorno en producción

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

    // Comparar contraseñas (asegúrate de encriptarlas al registrar)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Credenciales inválidas' });

    // Crear token con su rol y asociaciones
    const token = jwt.sign(
      { id: user._id, rol: user.rol, ligaId: user.ligaId, equipoId: user.equipoId }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        ligaId: user.ligaId,
        equipoId: user.equipoId
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;