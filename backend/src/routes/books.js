const express = require('express');
const { listBooks, getBook, createBook, updateBook, deleteBook, listCopies } = require('../controllers/booksController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/books', auth(['Admin', 'Librarian', 'Assistant', 'Member']), listBooks);
router.get('/books/:id', auth(['Admin', 'Librarian', 'Assistant', 'Member']), getBook);
router.post('/books', auth(['Admin', 'Librarian', 'Assistant']), createBook);
router.put('/books/:id', auth(['Admin', 'Librarian', 'Assistant']), updateBook);
router.delete('/books/:id', auth(['Admin']), deleteBook);
router.get('/books/:bookId/copies', auth(['Admin', 'Librarian', 'Assistant', 'Member']), listCopies);

module.exports = router;
