const express = require('express')
const router = express.Router()
const auth_ctrl = require('../controllers/auth')

router.post('/login', auth_ctrl.login)
router.get('/logout', auth_ctrl.logout)

module.exports = router