# CHAPTER 3. PHYSICAL & LOGICAL DATABASE IMPLEMENTATION

This document standardizes the LMS database schema in an AI‑friendly Markdown format. It is optimized for Chat AI tools in VS Code (Copilot, Continue, Cursor) and can be directly used to generate SQL, ERD, ORM models, and academic reports.

---

## TABLE: BOOK

Description: Stores bibliographic information of books.

| Column    | Data Type    | PK | FK | References | Null | Default        | Description                        |
| --------- | ------------ | -- | -- | ---------- | ---- | -------------- | ---------------------------------- |
| BookID    | INT          | ✓  |    |            | NO   | AUTO_INCREMENT | Unique book identifier             |
| ISBN      | VARCHAR(20)  |    |    |            | NO   |                | International Standard Book Number |
| Title     | VARCHAR(255) |    |    |            | NO   |                | Book title                         |
| Publisher | VARCHAR(255) |    |    |            | YES  | NULL           | Publisher name                     |
| PubYear   | INT          |    |    |            | YES  | NULL           | Publication year                   |

---

## TABLE: BOOKCOPY

Description: Represents physical copies of books.

| Column   | Data Type    | PK | FK | References   | Null | Default        | Description     |
| -------- | ------------ | -- | -- | ------------ | ---- | -------------- | --------------- |
| CopyID   | INT          | ✓  |    |              | NO   | AUTO_INCREMENT | Copy identifier |
| BookID   | INT          |    | ✓  | BOOK(BookID) | NO   |                | Associated book |
| Location | VARCHAR(100) |    |    |              | NO   |                | Shelf location  |
| Status   | VARCHAR(50)  |    |    |              | NO   | 'Available'    | Copy status     |

---

## TABLE: AUTHOR

Description: Stores author information.

| Column      | Data Type    | PK | FK | References | Null | Default        | Description       |
| ----------- | ------------ | -- | -- | ---------- | ---- | -------------- | ----------------- |
| AuthorID    | INT          | ✓  |    |            | NO   | AUTO_INCREMENT | Author identifier |
| FullName    | VARCHAR(255) |    |    |            | NO   |                | Author full name  |
| BirthYear   | INT          |    |    |            | YES  | NULL           | Birth year        |
| Biography   | TEXT         |    |    |            | YES  | NULL           | Author biography  |
| Nationality | VARCHAR(100) |    |    |            | YES  | NULL           | Nationality       |

---

## TABLE: BOOK_AUTHOR

Description: Resolves many‑to‑many relationship between books and authors.

| Column      | Data Type | PK | FK | References       | Null | Default | Description         |
| ----------- | --------- | -- | -- | ---------------- | ---- | ------- | ------------------- |
| BookID      | INT       | ✓  | ✓  | BOOK(BookID)     | NO   |         | Book identifier     |
| AuthorID    | INT       | ✓  | ✓  | AUTHOR(AuthorID) | NO   |         | Author identifier   |
| AuthorOrder | INT       |    |    |                  | NO   | 1       | Order of authorship |

---

## TABLE: CATEGORY

Description: Defines book categories.

| Column      | Data Type    | PK | FK | References | Null | Default        | Description          |
| ----------- | ------------ | -- | -- | ---------- | ---- | -------------- | -------------------- |
| CategoryID  | INT          | ✓  |    |            | NO   | AUTO_INCREMENT | Category identifier  |
| Name        | VARCHAR(100) |    |    |            | NO   |                | Category name        |
| Description | TEXT         |    |    |            | YES  | NULL           | Category description |

---

## TABLE: BOOK_CATEGORY

Description: Maps books to categories.

| Column     | Data Type | PK | FK | References           | Null | Default | Description         |
| ---------- | --------- | -- | -- | -------------------- | ---- | ------- | ------------------- |
| BookID     | INT       | ✓  | ✓  | BOOK(BookID)         | NO   |         | Book identifier     |
| CategoryID | INT       | ✓  | ✓  | CATEGORY(CategoryID) | NO   |         | Category identifier |

---

## TABLE: MEMBER

Description: Stores library member information.

| Column        | Data Type    | PK | FK | References | Null | Default           | Description       |
| ------------- | ------------ | -- | -- | ---------- | ---- | ----------------- | ----------------- |
| MemberID      | INT          | ✓  |    |            | NO   | AUTO_INCREMENT    | Member identifier |
| FullName      | VARCHAR(255) |    |    |            | NO   |                   | Member full name  |
| Email         | VARCHAR(255) |    |    |            | NO   |                   | Email address     |
| Phone         | VARCHAR(20)  |    |    |            | YES  | NULL              | Phone number      |
| Address       | VARCHAR(255) |    |    |            | YES  | NULL              | Address           |
| MemberType    | VARCHAR(50)  |    |    |            | NO   |                   | Member type       |
| CardIssueDate | DATETIME     |    |    |            | NO   | CURRENT_TIMESTAMP | Card issue date   |
| Status        | VARCHAR(50)  |    |    |            | NO   |                   | Member status     |

---

## TABLE: STAFF

Description: Stores staff accounts.

| Column       | Data Type    | PK | FK | References | Null | Default        | Description         |
| ------------ | ------------ | -- | -- | ---------- | ---- | -------------- | ------------------- |
| StaffID      | INT          | ✓  |    |            | NO   | AUTO_INCREMENT | Staff identifier    |
| FullName     | VARCHAR(255) |    |    |            | NO   |                | Staff full name     |
| Email        | VARCHAR(255) |    |    |            | NO   |                | Staff email         |
| Role         | VARCHAR(50)  |    |    |            | NO   |                | Staff role          |
| PasswordHash | VARCHAR(255) |    |    |            | NO   |                | Hashed password     |
| ActiveFlag   | BOOLEAN      |    |    |            | NO   | TRUE           | Account active flag |

---

## TABLE: LOAN

Description: Tracks borrowing transactions.

| Column     | Data Type   | PK | FK | References       | Null | Default           | Description      |
| ---------- | ----------- | -- | -- | ---------------- | ---- | ----------------- | ---------------- |
| LoanID     | INT         | ✓  |    |                  | NO   | AUTO_INCREMENT    | Loan identifier  |
| CopyID     | INT         |    | ✓  | BOOKCOPY(CopyID) | NO   |                   | Borrowed copy    |
| MemberID   | INT         |    | ✓  | MEMBER(MemberID) | NO   |                   | Borrowing member |
| StaffID    | INT         |    | ✓  | STAFF(StaffID)   | NO   |                   | Processing staff |
| LoanDate   | DATETIME    |    |    |                  | NO   | CURRENT_TIMESTAMP | Loan date        |
| DueDate    | DATETIME    |    |    |                  | NO   |                   | Due date         |
| ReturnDate | DATETIME    |    |    |                  | YES  | NULL              | Return date      |
| Status     | VARCHAR(50) |    |    |                  | NO   |                   | Loan status      |

---

## TABLE: RESERVATION

Description: Manages book reservations.

| Column          | Data Type   | PK | FK | References       | Null | Default           | Description            |
| --------------- | ----------- | -- | -- | ---------------- | ---- | ----------------- | ---------------------- |
| ReservationID   | INT         | ✓  |    |                  | NO   | AUTO_INCREMENT    | Reservation identifier |
| BookID          | INT         |    | ✓  | BOOK(BookID)     | NO   |                   | Reserved book          |
| MemberID        | INT         |    | ✓  | MEMBER(MemberID) | NO   |                   | Reserving member       |
| ReserveDate     | DATETIME    |    |    |                  | NO   | CURRENT_TIMESTAMP | Reservation date       |
| ExpireDate      | DATETIME    |    |    |                  | NO   |                   | Expiration date        |
| MemberType      | VARCHAR(50) |    |    |                  | NO   |                   | Member type            |
| PositionInQueue | INT         |    |    |                  | NO   |                   | Queue position         |
| Status          | VARCHAR(50) |    |    |                  | NO   |                   | Reservation status     |

---

## TABLE: SUPPLIER

Description: Stores supplier information.

| Column     | Data Type    | PK | FK | References | Null | Default        | Description         |
| ---------- | ------------ | -- | -- | ---------- | ---- | -------------- | ------------------- |
| SupplierID | INT          | ✓  |    |            | NO   | AUTO_INCREMENT | Supplier identifier |
| Name       | VARCHAR(255) |    |    |            | NO   |                | Supplier name       |
| Contact    | VARCHAR(255) |    |    |            | YES  | NULL           | Contact person      |
| Email      | VARCHAR(255) |    |    |            | YES  | NULL           | Email               |
| Phone      | VARCHAR(20)  |    |    |            | YES  | NULL           | Phone               |
| Address    | VARCHAR(255) |    |    |            | YES  | NULL           | Address             |

---

## TABLE: PURCHASEORDER

Description: Records purchase orders.

| Column       | Data Type   | PK | FK | References           | Null | Default           | Description       |
| ------------ | ----------- | -- | -- | -------------------- | ---- | ----------------- | ----------------- |
| POID         | INT         | ✓  |    |                      | NO   | AUTO_INCREMENT    | Purchase order ID |
| SupplierID   | INT         |    | ✓  | SUPPLIER(SupplierID) | NO   |                   | Supplier          |
| StaffID      | INT         |    | ✓  | STAFF(StaffID)       | NO   |                   | Staff             |
| OrderDate    | DATETIME    |    |    |                      | NO   | CURRENT_TIMESTAMP | Order date        |
| ExpectedDate | DATETIME    |    |    |                      | YES  | NULL              | Expected delivery |
| Status       | VARCHAR(50) |    |    |                      | NO   |                   | Order status      |

---

## TABLE: PO_DETAILS

Description: Line items of purchase orders.

| Column     | Data Type     | PK | FK | References          | Null | Default        | Description    |
| ---------- | ------------- | -- | -- | ------------------- | ---- | -------------- | -------------- |
| PODetailID | INT           | ✓  |    |                     | NO   | AUTO_INCREMENT | Detail ID      |
| POID       | INT           |    | ✓  | PURCHASEORDER(POID) | NO   |                | Purchase order |
| BookID     | INT           |    | ✓  | BOOK(BookID)        | NO   |                | Ordered book   |
| Quantity   | INT           |    |    |                     | NO   |                | Quantity       |
| UnitPrice  | DECIMAL(10,2) |    |    |                     | NO   |                | Unit price     |

---

## TABLE: FINEPAYMENT

Description: Records fine payments.

| Column      | Data Type     | PK | FK | References       | Null | Default           | Description    |
| ----------- | ------------- | -- | -- | ---------------- | ---- | ----------------- | -------------- |
| PaymentID   | INT           | ✓  |    |                  | NO   | AUTO_INCREMENT    | Payment ID     |
| LoanID      | INT           |    | ✓  | LOAN(LoanID)     | NO   |                   | Related loan   |
| MemberID    | INT           |    | ✓  | MEMBER(MemberID) | NO   |                   | Paying member  |
| Amount      | DECIMAL(10,2) |    |    |                  | NO   |                   | Paid amount    |
| PaymentDate | DATETIME      |    |    |                  | NO   | CURRENT_TIMESTAMP | Payment date   |
| Method      | VARCHAR(50)   |    |    |                  | NO   |                   | Payment method |
| Status      | VARCHAR(50)   |    |    |                  | NO   |                   | Payment status |

---

## TABLE: LOSTREPORT

Description: Tracks lost book reports.

| Column             | Data Type     | PK | FK | References       | Null | Default           | Description         |
| ------------------ | ------------- | -- | -- | ---------------- | ---- | ----------------- | ------------------- |
| ReportID           | INT           | ✓  |    |                  | NO   | AUTO_INCREMENT    | Report ID           |
| LoanID             | INT           |    | ✓  | LOAN(LoanID)     | NO   |                   | Related loan        |
| CopyID             | INT           |    | ✓  | BOOKCOPY(CopyID) | NO   |                   | Lost copy           |
| MemberID           | INT           |    | ✓  | MEMBER(MemberID) | NO   |                   | Reporting member    |
| ReportDate         | DATETIME      |    |    |                  | NO   | CURRENT_TIMESTAMP | Report date         |
| CompensationAmount | DECIMAL(10,2) |    |    |                  | NO   |                   | Compensation amount |
| Status             | VARCHAR(50)   |    |    |                  | NO   |                   | Report status       |

---

## TABLE: AUDITLOG

Description: Stores audit logs for system actions.

| Column    | Data Type    | PK | FK | References     | Null | Default           | Description        |
| --------- | ------------ | -- | -- | -------------- | ---- | ----------------- | ------------------ |
| LogID     | INT          | ✓  |    |                | NO   | AUTO_INCREMENT    | Log ID             |
| StaffID   | INT          |    | ✓  | STAFF(StaffID) | NO   |                   | Acting staff       |
| Action    | VARCHAR(100) |    |    |                | NO   |                   | Action type        |
| TableName | VARCHAR(100) |    |    |                | NO   |                   | Affected table     |
| RecordID  | INT          |    |    |                | NO   |                   | Record identifier  |
| Timestamp | DATETIME     |    |    |                | NO   | CURRENT_TIMESTAMP | Action time        |
| Details   | TEXT         |    |    |                | YES  | NULL              | Additional details |
