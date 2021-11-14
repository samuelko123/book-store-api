const book_ctrl = require('../controllers/books')

const router = require('express').Router()
router.post('/', book_ctrl.insert_one)
router.get('/', book_ctrl.find_many)
router.get('/:isbn', book_ctrl.find_one)
router.patch('/:isbn', book_ctrl.update_one)
router.delete('/:isbn', book_ctrl.delete_one)

module.exports = router