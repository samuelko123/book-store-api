const express = require('express')
const router = express.Router()
const controller = require(`${process.cwd()}/controllers/books`)

router.post('/', controller.create)
router.get('/:isbn', controller.findOne)
router.get('/', controller.sanitiseQuery, controller.findMany)
router.patch('/:isbn', controller.updateOne)
router.patch('/', controller.updateMany)
router.delete('/:isbn', controller.deleteOne)
router.delete('/', controller.deleteMany)

module.exports = router