const express = require('express')
const router = express.Router()
const user_ctrl = require('../controllers/users')
const auth_ctrl = require('../controllers/auth')

router.post('/', auth_ctrl.admin_only, user_ctrl.insertOne)
router.get('/', auth_ctrl.admin_only, user_ctrl.findMany)
router.get('/:username', auth_ctrl.admin_only, user_ctrl.findOne)
router.patch('/:username', auth_ctrl.admin_only, user_ctrl.updateOne)
router.delete('/:username', auth_ctrl.admin_only, user_ctrl.deleteOne)

module.exports = router