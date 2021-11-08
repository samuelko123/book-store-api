const express = require('express')
const router = express.Router()
const book_ctrl = require('../controllers/books')
const auth_ctrl = require('../controllers/auth')

router.post('/', auth_ctrl.admin_only, book_ctrl.insertOne)
router.get('/', book_ctrl.findMany)
router.get('/:isbn', book_ctrl.findOne)
router.patch('/:isbn', auth_ctrl.admin_only, book_ctrl.updateOne)
router.delete('/:isbn', auth_ctrl.admin_only, book_ctrl.deleteOne)

module.exports = router