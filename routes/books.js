const express = require('express')
const router = express.Router()
const controller = require('../controllers/books')

router.post('/', controller.insertOne)
router.get('/:isbn', controller.findOne)
router.get('/', controller.findMany)
router.patch('/:isbn', controller.updateOne)
router.delete('/:isbn', controller.deleteOne)

module.exports = router