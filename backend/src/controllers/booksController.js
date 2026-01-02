const { pool } = require('../config/db');

async function listBooks(req, res) {
  const [rows] = await pool.execute(
    `SELECT B.BookID, B.Title, B.ISBN, B.Publisher, B.PubYear,
            COUNT(BC.CopyID) AS TotalCopies,
            COUNT(CASE WHEN BC.Status = 'Available' THEN 1 END) AS AvailableCopies,
            COUNT(CASE WHEN BC.Status = 'Borrowed' THEN 1 END) AS BorrowedCopies,
            GROUP_CONCAT(A.FullName SEPARATOR ', ') AS Authors
     FROM BOOK B
     LEFT JOIN BOOKCOPY BC ON B.BookID = BC.BookID
     LEFT JOIN BOOK_AUTHOR BA ON B.BookID = BA.BookID
     LEFT JOIN AUTHOR A ON BA.AuthorID = A.AuthorID
     GROUP BY B.BookID, B.Title, B.ISBN, B.Publisher, B.PubYear
     ORDER BY B.Title`
  );
  res.json(rows);
}

async function getBook(req, res) {
  const { id } = req.params;
  const [rows] = await pool.execute(
    'SELECT BookID, Title, ISBN, Publisher, PubYear FROM BOOK WHERE BookID = ? LIMIT 1',
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
}

async function createBook(req, res) {
  const { Title, ISBN, Publisher, PubYear } = req.body;
  if (!Title || !ISBN) return res.status(400).json({ message: 'Title and ISBN are required' });
  const [result] = await pool.execute(
    'INSERT INTO BOOK (Title, ISBN, Publisher, PubYear) VALUES (?, ?, ?, ?)',
    [Title, ISBN, Publisher || null, PubYear || null]
  );
  res.status(201).json({ BookID: result.insertId, Title, ISBN, Publisher, PubYear });
}

async function updateBook(req, res) {
  const { id } = req.params;
  const { Title, ISBN, Publisher, PubYear } = req.body;
  const [result] = await pool.execute(
    'UPDATE BOOK SET Title = COALESCE(?, Title), ISBN = COALESCE(?, ISBN), Publisher = COALESCE(?, Publisher), PubYear = COALESCE(?, PubYear) WHERE BookID = ?',
    [Title, ISBN, Publisher, PubYear, id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Updated' });
}

async function deleteBook(req, res) {
  const { id } = req.params;
  const [result] = await pool.execute('DELETE FROM BOOK WHERE BookID = ?', [id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
}

async function listCopies(req, res) {
  const { bookId } = req.params;
  const [rows] = await pool.execute(
    'SELECT CopyID, BookID, Location, Status FROM BOOKCOPY WHERE BookID = ? ORDER BY CopyID',
    [bookId]
  );
  res.json(rows);
}

module.exports = { listBooks, getBook, createBook, updateBook, deleteBook, listCopies };
