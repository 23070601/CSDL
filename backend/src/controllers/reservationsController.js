const { pool } = require('../config/db');
const { generateLogId, generateLoanId } = require('../utils/id');

async function listActiveReservations(req, res) {
  const [rows] = await pool.execute(
    `SELECT R.ReservationID, R.BookID, B.Title, R.MemberID, M.FullName, R.ReserveDate, R.PositionInQueue, R.Status
     FROM RESERVATION R
     INNER JOIN BOOK B ON R.BookID = B.BookID
     INNER JOIN MEMBER M ON R.MemberID = M.MemberID
     WHERE R.Status = 'Active'
     ORDER BY R.BookID, R.PositionInQueue`
  );
  res.json(rows);
}

async function fulfillReservation(req, res) {
  const { reservationId } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [reservations] = await conn.execute(
      `SELECT ReservationID, BookID, MemberID, PositionInQueue, Status
       FROM RESERVATION WHERE ReservationID = ? FOR UPDATE`,
      [reservationId]
    );
    if (!reservations.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Reservation not found' });
    }
    const reservation = reservations[0];
    if (reservation.Status !== 'Active' || reservation.PositionInQueue !== 1) {
      await conn.rollback();
      return res.status(400).json({ message: 'Reservation not eligible to fulfill' });
    }

    // Enforce hold window: ExpireDate acts as hold-until
    const [holdCheck] = await conn.execute(
      'SELECT ExpireDate FROM RESERVATION WHERE ReservationID = ?',
      [reservationId]
    );
    if (holdCheck.length && holdCheck[0].ExpireDate && new Date(holdCheck[0].ExpireDate) < new Date()) {
      await conn.rollback();
      return res.status(400).json({ message: 'Hold expired' });
    }

    const [copies] = await conn.execute(
      'SELECT CopyID FROM BOOKCOPY WHERE BookID = ? AND Status = ? LIMIT 1 FOR UPDATE',
      [reservation.BookID, 'Available']
    );
    if (!copies.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'No available copies' });
    }
    const copyId = copies[0].CopyID;
    const loanId = generateLoanId();

    await conn.execute(
      'INSERT INTO LOAN (LoanID, MemberID, CopyID, StaffID, LoanDate, DueDate, Status) VALUES (?, ?, ?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), ?)',
      [loanId, reservation.MemberID, copyId, 'ST001', 'Borrowed']
    );

    await conn.execute('UPDATE BOOKCOPY SET Status = ? WHERE CopyID = ?', ['Borrowed', copyId]);
    await conn.execute('UPDATE RESERVATION SET Status = ? WHERE ReservationID = ?', ['Fulfilled', reservation.ReservationID]);
    await conn.execute(
      'UPDATE RESERVATION SET PositionInQueue = PositionInQueue - 1 WHERE BookID = ? AND Status = ? AND PositionInQueue > 1',
      [reservation.BookID, 'Active']
    );

    const logId = generateLogId();
    await conn.execute(
      'INSERT INTO AUDITLOG (LogID, StaffID, Action, TableName, RecordID, Timestamp, Details) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)',
      [logId, 'ST001', 'CREATE', 'Loan', 22, `Reservation ${reservation.ReservationID} fulfilled to loan ${loanId}`]
    );

    await conn.commit();
    res.json({ message: 'Reservation fulfilled', LoanID: loanId, CopyID: copyId });
  } catch (err) {
    await conn.rollback();
    console.error('fulfillReservation error', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
}

async function cancelReservation(req, res) {
  const { reservationId } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [reservations] = await conn.execute(
      'SELECT ReservationID, Status FROM RESERVATION WHERE ReservationID = ? FOR UPDATE',
      [reservationId]
    );
    if (!reservations.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Reservation not found' });
    }
    if (reservations[0].Status !== 'Active') {
      await conn.rollback();
      return res.status(400).json({ message: 'Only active reservations can be cancelled' });
    }
    await conn.execute('UPDATE RESERVATION SET Status = ? WHERE ReservationID = ?', ['Cancelled', reservationId]);
    await conn.commit();
    res.json({ message: 'Cancelled' });
  } catch (err) {
    await conn.rollback();
    console.error('cancelReservation error', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
}

module.exports = { listActiveReservations, fulfillReservation, cancelReservation };

async function createReservation(req, res) {
  const { bookId, memberId } = req.body;
  
  if (!bookId || !memberId) {
    return res.status(400).json({ message: 'BookID and MemberID are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if member exists
    const [members] = await conn.execute(
      'SELECT MemberID FROM MEMBER WHERE MemberID = ?',
      [memberId]
    );
    if (!members.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if book exists
    const [books] = await conn.execute(
      'SELECT BookID FROM BOOK WHERE BookID = ?',
      [bookId]
    );
    if (!books.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if member already has an active reservation for this book
    const [existing] = await conn.execute(
      'SELECT ReservationID FROM RESERVATION WHERE BookID = ? AND MemberID = ? AND Status = ?',
      [bookId, memberId, 'Active']
    );
    if (existing.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'Member already has an active reservation for this book' });
    }

    // Get the next position in queue for this book
    const [queue] = await conn.execute(
      'SELECT MAX(PositionInQueue) AS MaxPosition FROM RESERVATION WHERE BookID = ? AND Status = ?',
      [bookId, 'Active']
    );
    const nextPosition = (queue[0].MaxPosition || 0) + 1;

    // Generate reservation ID
    const reservationId = `R${Date.now()}`;

    // Create the reservation
    await conn.execute(
      `INSERT INTO RESERVATION (ReservationID, BookID, MemberID, ReserveDate, PositionInQueue, Status, ExpireDate)
       VALUES (?, ?, ?, CURRENT_DATE, ?, ?, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY))`,
      [reservationId, bookId, memberId, nextPosition, 'Active']
    );

    const logId = generateLogId();
    await conn.execute(
      'INSERT INTO AUDITLOG (LogID, StaffID, Action, TableName, RecordID, Timestamp, Details) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)',
      [logId, req.user?.id || 'ST001', 'CREATE', 'Reservation', reservationId, `Created reservation for Book ${bookId}, Member ${memberId}`]
    );

    await conn.commit();
    res.status(201).json({ 
      message: 'Reservation created successfully',
      ReservationID: reservationId,
      PositionInQueue: nextPosition
    });
  } catch (err) {
    await conn.rollback();
    console.error('createReservation error:', err);
    res.status(500).json({ message: 'Failed to create reservation', error: err.message });
  } finally {
    conn.release();
  }
}

module.exports = { listActiveReservations, fulfillReservation, cancelReservation, createReservation };
