const express = require('express')
const router = express.Router()
const controller = require(`${process.cwd()}/controllers/books`)

router.post('/', controller.createOne)
router.get('/', controller.sanitiseQuery, controller.find)
router.get('/:isbn', controller.findOne)
router.patch('/:isbn', controller.updateOne)
router.delete('/:isbn', controller.deleteOne)

module.exports = router