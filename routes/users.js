const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')

router.post('/', controller.createOne)
router.get('/:username', controller.findOne)
router.get('/', controller.sanitiseQuery, controller.findMany)
router.patch('/:username', controller.updateOne)
router.delete('/:username', controller.deleteOne)

module.exports = router