const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.post('/', controller.create)
router.get('/:username', controller.findOne)
router.get('/', controller.sanitiseQuery, controller.findMany)
router.patch('/:username', controller.updateOne)
router.patch('/', controller.updateMany)
router.delete('/:username', controller.deleteOne)
router.delete('/', controller.deleteMany)

module.exports = router