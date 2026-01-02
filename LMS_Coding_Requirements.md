# CODING REQUIREMENTS FOR LMS (Derived from System Requirements)

## 1. Authentication & Authorization
### Functional
- User login/logout
- Role-Based Access Control (Admin, Librarian, Member)
- Session / token management

### Implementation Notes
- Password hashing (bcrypt/argon2)
- Middleware for role checking
- Protected routes

---

## 2. Admin Module
### Features
- Manage staff accounts (CRUD)
- Manage books and categories
- Manage suppliers and purchase orders
- View system-wide reports
- Audit log monitoring

### Database / SQL
- INSERT, UPDATE, DELETE on STAFF, BOOK, SUPPLIER, PURCHASEORDER
- Aggregation queries for reports
- Audit logging triggers or manual inserts

---

## 3. Librarian Module
### Features
- Book circulation (borrow / return)
- Reservation handling
- Member management
- Fine calculation and payment tracking

### Database / SQL
- TRANSACTION for borrow/return
- UPDATE book copy status
- INSERT loan records
- Fine calculation queries

---

## 4. Member Module
### Features
- Search and view books
- Borrow and reserve books
- Renew loans
- View loan history
- Pay fines
- Notifications

### Database / SQL
- SELECT with JOIN for search
- INSERT reservation
- UPDATE loan (renew)
- VIEW for member status

---

## 5. Reporting & Analytics
### Features
- Popular books analysis
- Member activity reports
- Supplier performance reports

### Database / SQL
- GROUP BY, HAVING
- CASE expressions
- Aggregate functions
- Indexed columns for performance

---

## 6. Performance Requirements
### Implementation
- Create indexes on frequently queried columns
- Optimize queries using EXPLAIN
- Avoid unnecessary SELECT *

---

## 7. Security Requirements
### Implementation
- Principle of least privilege (GRANT/REVOKE)
- Secure database credentials (.env)
- Input validation & SQL injection prevention

---

## 8. Reliability & Recovery
### Implementation
- Database backup strategy
- Transaction rollback on failure
- Error logging

---

## 9. Non-Functional Mapping Summary

| Requirement Type | Code / SQL Impact |
|-----------------|------------------|
| Performance | Indexes, optimized queries |
| Security | RBAC, hashing, privileges |
| Reliability | Transactions, rollback |
| Maintainability | Modular code structure |
| Availability | Backup & recovery |

---

## 10. Purpose of This File
- Used as a coding checklist
- Input for AI code generation
- Bridge between requirements and implementation
