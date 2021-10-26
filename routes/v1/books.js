const express = require('express')
const router = express.Router()
const controller = require(`${process.cwd()}/controllers/books`)

router.post('/', controller.create)
router.get('/', controller.sanitiseQuery, controller.findMany)
router.get('/:isbn', controller.findOne)
router.patch('/:isbn', controller.updateOne)
router.delete('/:isbn', controller.deleteOne)
router.delete('/', controller.deleteMany)

module.exports = router