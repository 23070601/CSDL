-- =============================================
-- Library Management System (LMS) Database
-- Database Creation and Table Structures
-- =============================================

-- Create Database
DROP DATABASE IF EXISTS LibraryDB;
CREATE DATABASE LibraryDB;
USE LibraryDB;

-- =============================================
-- TABLE: BOOK
-- Description: Stores bibliographic information of books
-- =============================================
CREATE TABLE BOOK (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    ISBN VARCHAR(20) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Publisher VARCHAR(255) NULL,
    PubYear INT NULL,
    INDEX idx_isbn (ISBN),
    INDEX idx_title (Title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: BOOKCOPY
-- Description: Represents physical copies of books
-- =============================================
CREATE TABLE BOOKCOPY (
    CopyID VARCHAR(10) PRIMARY KEY,
    BookID INT NOT NULL,
    Location VARCHAR(100) NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Available',
    FOREIGN KEY (BookID) REFERENCES BOOK(BookID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_book (BookID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: AUTHOR
-- Description: Stores author information
-- =============================================
CREATE TABLE AUTHOR (
    AuthorID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(255) NOT NULL,
    BirthYear INT NULL,
    Biography TEXT NULL,
    Nationality VARCHAR(100) NULL,
    INDEX idx_fullname (FullName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: BOOK_AUTHOR
-- Description: Resolves many-to-many relationship between books and authors
-- =============================================
CREATE TABLE BOOK_AUTHOR (
    BookID INT NOT NULL,
    AuthorID INT NOT NULL,
    AuthorOrder INT NOT NULL DEFAULT 1,
    PRIMARY KEY (BookID, AuthorID),
    FOREIGN KEY (BookID) REFERENCES BOOK(BookID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (AuthorID) REFERENCES AUTHOR(AuthorID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_author (AuthorID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: CATEGORY
-- Description: Defines book categories
-- =============================================
CREATE TABLE CATEGORY (
    CategoryID VARCHAR(10) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT NULL,
    INDEX idx_name (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: BOOK_CATEGORY
-- Description: Maps books to categories
-- =============================================
CREATE TABLE BOOK_CATEGORY (
    BookID INT NOT NULL,
    CategoryID VARCHAR(10) NOT NULL,
    PRIMARY KEY (BookID, CategoryID),
    FOREIGN KEY (BookID) REFERENCES BOOK(BookID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES CATEGORY(CategoryID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_category (CategoryID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: MEMBER
-- Description: Stores library member information
-- =============================================
CREATE TABLE MEMBER (
    MemberID VARCHAR(10) PRIMARY KEY,
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(20) NULL,
    Address VARCHAR(255) NULL,
    MemberType VARCHAR(50) NOT NULL,
    PasswordHash VARCHAR(255) NULL,
    CardIssueDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(50) NOT NULL,
    UNIQUE INDEX idx_email (Email),
    INDEX idx_membertype (MemberType),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: STAFF
-- Description: Stores staff accounts
-- =============================================
CREATE TABLE STAFF (
    StaffID VARCHAR(10) PRIMARY KEY,
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    ActiveFlag BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE INDEX idx_email (Email),
    INDEX idx_role (Role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: LOAN
-- Description: Tracks borrowing transactions
-- =============================================
CREATE TABLE LOAN (
    LoanID VARCHAR(10) PRIMARY KEY,
    CopyID VARCHAR(10) NOT NULL,
    MemberID VARCHAR(10) NOT NULL,
    StaffID VARCHAR(10) NOT NULL,
    LoanDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DueDate DATETIME NOT NULL,
    ReturnDate DATETIME NULL,
    RenewalCount INT NOT NULL DEFAULT 0,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (CopyID) REFERENCES BOOKCOPY(CopyID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (StaffID) REFERENCES STAFF(StaffID) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_copy (CopyID),
    INDEX idx_member (MemberID),
    INDEX idx_staff (StaffID),
    INDEX idx_status (Status),
    INDEX idx_duedate (DueDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: RESERVATION
-- Description: Manages book reservations
-- =============================================
CREATE TABLE RESERVATION (
    ReservationID VARCHAR(10) PRIMARY KEY,
    BookID INT NOT NULL,
    MemberID VARCHAR(10) NOT NULL,
    ReserveDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpireDate DATETIME NOT NULL,
    MemberType VARCHAR(50) NOT NULL,
    PositionInQueue INT NOT NULL,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (BookID) REFERENCES BOOK(BookID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_book (BookID),
    INDEX idx_member (MemberID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: SUPPLIER
-- Description: Stores supplier information
-- =============================================
CREATE TABLE SUPPLIER (
    SupplierID VARCHAR(15) PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Contact VARCHAR(255) NULL,
    Email VARCHAR(255) NULL,
    Phone VARCHAR(20) NULL,
    Address VARCHAR(255) NULL,
    INDEX idx_name (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: PURCHASEORDER
-- Description: Records purchase orders
-- =============================================
CREATE TABLE PURCHASEORDER (
    POID VARCHAR(10) PRIMARY KEY,
    SupplierID VARCHAR(15) NOT NULL,
    StaffID VARCHAR(10) NOT NULL,
    OrderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpectedDate DATETIME NULL,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (SupplierID) REFERENCES SUPPLIER(SupplierID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (StaffID) REFERENCES STAFF(StaffID) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_supplier (SupplierID),
    INDEX idx_staff (StaffID),
    INDEX idx_status (Status),
    INDEX idx_orderdate (OrderDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: PURCHASEORDER_DETAILS
-- Description: Line items of purchase orders
-- =============================================
CREATE TABLE PURCHASEORDER_DETAILS (
    PODetailID VARCHAR(10) PRIMARY KEY,
    POID VARCHAR(10) NOT NULL,
    BookID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (POID) REFERENCES PURCHASEORDER(POID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (BookID) REFERENCES BOOK(BookID) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_poid (POID),
    INDEX idx_book (BookID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: FINEPAYMENT
-- Description: Records fine payments
-- =============================================
CREATE TABLE FINEPAYMENT (
    PaymentID VARCHAR(10) PRIMARY KEY,
    LoanID VARCHAR(10) NOT NULL,
    MemberID VARCHAR(10) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Method VARCHAR(50) NOT NULL,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (LoanID) REFERENCES LOAN(LoanID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_loan (LoanID),
    INDEX idx_member (MemberID),
    INDEX idx_paymentdate (PaymentDate),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: LOSTREPORT
-- Description: Tracks lost book reports
-- =============================================
CREATE TABLE LOSTREPORT (
    ReportID VARCHAR(10) PRIMARY KEY,
    LoanID VARCHAR(10) NOT NULL,
    CopyID VARCHAR(10) NOT NULL,
    MemberID VARCHAR(10) NOT NULL,
    ReportDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CompensationAmount DECIMAL(10,2) NOT NULL,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (LoanID) REFERENCES LOAN(LoanID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (CopyID) REFERENCES BOOKCOPY(CopyID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_loan (LoanID),
    INDEX idx_copy (CopyID),
    INDEX idx_member (MemberID),
    INDEX idx_reportdate (ReportDate),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: AUDITLOG
-- Description: Stores audit logs for system actions
-- =============================================
CREATE TABLE AUDITLOG (
    LogID VARCHAR(10) PRIMARY KEY,
    StaffID VARCHAR(10) NOT NULL,
    Action VARCHAR(100) NOT NULL,
    TableName VARCHAR(100) NOT NULL,
    RecordID INT NOT NULL,
    Timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Details TEXT NULL,
    FOREIGN KEY (StaffID) REFERENCES STAFF(StaffID) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_staff (StaffID),
    INDEX idx_action (Action),
    INDEX idx_table (TableName),
    INDEX idx_timestamp (Timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- End of Database Schema
-- =============================================
-- =============================================
-- DATA IMPORT SECTION
-- =============================================

-- Disable foreign key checks for data import
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- TABLE: BOOK - Import data (30 rows already exists)
-- =============================================
INSERT INTO BOOK (BookID, Title, ISBN, Publisher, PubYear) VALUES
(1, 'Data mining for business analytics', '9780132350884', 'John Wiley & Sons, Inc.', 2018),
(2, 'An  introduction to database systems', '9780201616224', 'Pearson/Addison Wesley', 2004),
(3, 'Artificial Intelligence', '9780201633610', 'Addison-Wesley', 2004),
(4, 'Database Management Systems', '9780262033848', 'McGraw-Hill', 1999),
(5, 'Management Information Systems ', '9780073523323', 'McGraw Hill', 2011),
(6, 'Hands-On Projects To Build A Website With HTML And CSS', '9780136042594', 'Gabriel, York', 2022),
(7, 'Computer networking', '9781118063330', 'Pearson', 2002),
(8, 'Information Technology Project Management', '9780132126953', 'Cengage Learning', 2016),
(9, 'The human side of digital business transformation', '9780590353427', 'John Wiley & Sons', 2023),
(10, 'Internet Marketing & E-commerce', '9780439064873', ' Thomson/South-Western', 2007),
(11, 'Digital marketing', '9780618640157', ' Pearson Education Limited', 2016),
(12, 'C primer plus.', '9780547928227', 'Addison-Wesley', 2014),
(13, 'Microsoft Office 2010 essential', '9780061120084', 'Course Technology, Cengage Learning', 2011),
(14, 'Mathematics for economics and business', '9780451524935', 'Pearson Education', 2018),
(15, 'Business statistics', '9780743273565', 'Cengage Learning', 2017),
(16, 'Computer Networking', '9781503290563', 'Pearson', 2021),
(17, 'Enterprise information systems', '9780316769488', ' World Scientific Pub.', 2010),
(18, 'Law of Electronic Commercial Transactions', '9780062315007', 'Routledge', 2014),
(19, 'Intellectual Property', '9780062316097', 'Pearson', 2010),
(20, 'Data Structures and Algorithms with C', '9780062464316', 'Alpha Science International Ltd', 2018),
(21, 'PHP and MySQL Web Development', '9780316017930', 'Addison-Wesley', 2017),
(22, 'Quantitative Methods for Business ', '9780374533557', 'Financial Times Prentice Hall', 2011),
(23, 'Principles of information security', '9781612680194', 'Thomson Course Technology', 2018),
(24, 'Principles of marketing', '9780307887894', ' Pearson Education', 2018),
(25, 'Financial Accounting', '9780439136365', 'McGraw-Hill', 2019),
(26, 'Strategic Management', '9780590405041', 'Pearson', 2020),
(27, 'Auditing and Assurance Services', '9780545010221', 'Prentice Hall', 2017),
(28, 'Business Intelligence', '9780439023528', 'Wiley', 2019),
(29, 'Cost Accounting', '9780590543268', 'Cengage Learning', 2018),
(30, 'Corporate Finance', '9780439139601', 'McGraw-Hill', 2020);

-- =============================================
-- TABLE: AUTHOR - Import data (30 rows already exists)
-- =============================================
INSERT INTO AUTHOR (AuthorID, FullName, Nationality, BirthYear, Biography) VALUES
(23070401, 'Michael J. Berry', 'American', 1957, 'Data mining and business analytics expert'),
(23070402, 'Gordon S. Linoff', 'American', 1954, 'Predictive analytics and data mining specialist'),
(23070403, 'C. J. Date', 'British', 1941, 'Relational database theory pioneer'),
(23070404, 'Abraham Silberschatz', 'American', 1952, 'Database and operating systems professor'),
(23070405, 'Stuart Russell', 'British', 1962, 'Artificial intelligence researcher and educator'),
(23070406, 'Peter Norvig', 'American', 1956, 'AI scientist and technology researcher'),
(23070407, 'Raghu Ramakrishnan', 'Indian-American', 1965, 'Database systems researcher'),
(23070408, 'Henry F. Korth', 'American', 1957, 'Database management systems academic'),
(23070409, 'Kenneth C. Laudon', 'American', 1949, 'Management information systems author'),
(23070410, 'Gary B. Shelly', 'American', 1948, 'Information technology education author'),
(23070411, 'Andrew S. Tanenbaum', 'Dutch-American', 1944, 'Computer networking and systems expert'),
(23070412, 'Kathy Schwalbe', 'American', 1960, 'Project management consultant and author'),
(23070413, 'Lindsay Herbert', 'British', 1975, 'Digital transformation strategist'),
(23070414, 'Judy Strauss', 'American', 1963, 'Digital and internet marketing researcher'),
(23070415, 'Philip Kotler', 'American', 1931, 'Marketing theory and strategy scholar'),
(23070416, 'Stephen Prata', 'American', 1952, 'C programming language author'),
(23070417, 'David Beskeen', 'American', 1968, 'Computer applications textbook author'),
(23070418, 'Ian Jacques', 'British', 1966, 'Mathematics and business statistics author'),
(23070419, 'Ken Black', 'American', 1959, 'Business statistics and analytics expert'),
(23070420, 'Ralph Stair', 'American', 1951, 'Management information systems writer'),
(23070421, 'George Reynolds', 'American', 1958, 'Business law and e-commerce author'),
(23070422, 'Douglas W. Hubbard', 'American', 1962, 'Decision analysis and valuation expert'),
(23070423, 'Douglas W. Hubbard', 'American', 1962, 'Information security researcher'),
(23070424, 'Matt Bishop', 'American', 1965, 'Computer security and assurance expert'),
(23070425, 'Jan R. Williams', 'American', 1960, 'Financial accounting professor'),
(23070426, 'Fred R. David', 'American', 1951, 'Strategic management scholar'),
(23070427, 'Alvin A. Arens', 'American', 1936, 'Auditing and assurance expert'),
(23070428, 'Efraim Turban', 'Israeli-American', 1940, 'Business intelligence researcher'),
(23070429, 'Charles T. Horngren', 'American', 1926, 'Cost accounting pioneer'),
(23070430, 'Stephen A. Ross', 'American', 1944, 'Corporate finance theorist');

-- =============================================
-- TABLE: BOOK_AUTHOR - Import data (30 rows already exists)
-- =============================================
INSERT INTO BOOK_AUTHOR (BookID, AuthorID, AuthorOrder) VALUES
(1, 23070401, 2),
(2, 23070402, 2),
(3, 23070403, 1),
(4, 23070404, 1),
(5, 23070405, 1),
(6, 23070406, 2),
(7, 23070407, 1),
(8, 23070408, 1),
(9, 23070409, 2),
(10, 23070410, 2),
(11, 23070411, 1),
(12, 23070412, 2),
(13, 23070413, 2),
(14, 23070414, 1),
(15, 23070415, 1),
(16, 23070416, 1),
(17, 23070417, 1),
(18, 23070418, 1),
(19, 23070419, 1),
(20, 23070420, 1),
(21, 23070421, 1),
(22, 23070422, 1),
(23, 23070423, 1),
(24, 23070424, 1),
(25, 23070425, 1),
(26, 23070426, 1),
(27, 23070427, 2),
(28, 23070428, 1),
(29, 23070429, 1),
(30, 23070430, 1);

-- =============================================
-- TABLE: CATEGORY - Import data and add more to reach 20 rows
-- =============================================
INSERT INTO CATEGORY (CategoryID, Name, Description) VALUES
('CAT01', 'Information Technology', 'Books related to information technology and computing'),
('CAT02', 'Computer Science', 'Books on computer science fundamentals and programming'),
('CAT03', 'Data Science & Analytics', 'Books on data mining, analytics, and statistics'),
('CAT04', 'Database Systems', 'Books about database design and management'),
('CAT05', 'Artificial Intelligence', 'Books related to artificial intelligence and machine learning'),
('CAT06', 'Business & Management', 'Books on business management and information systems'),
('CAT07', 'Marketing & E-Commerce', 'Books on marketing, digital marketing, and e-commerce'),
('CAT08', 'Finance & Accounting', 'Books on finance, accounting, and auditing'),
('CAT09', 'Law & E-Business', 'Books related to business law and electronic commerce'),
('CAT10', 'Mathematics & Statistics', 'Books on mathematics and business statistics'),
('CAT11', 'Web Development', 'Books on web development, HTML, CSS, and JavaScript'),
('CAT12', 'Programming Languages', 'Books on various programming languages'),
('CAT13', 'Network Security', 'Books on cybersecurity and network protection'),
('CAT14', 'Project Management', 'Books on project management methodologies'),
('CAT15', 'Cloud Computing', 'Books on cloud technologies and services'),
('CAT16', 'Mobile Development', 'Books on mobile app development'),
('CAT17', 'Software Engineering', 'Books on software development methodologies'),
('CAT18', 'Operating Systems', 'Books on operating systems and system administration'),
('CAT19', 'Economics', 'Books on economics and economic theory'),
('CAT20', 'Human Resources', 'Books on HR management and organizational behavior');

-- =============================================
-- TABLE: BOOK_CATEGORY - Import data (39 rows already exists)
-- =============================================
INSERT INTO BOOK_CATEGORY (BookID, CategoryID) VALUES
(1, 'CAT03'), (1, 'CAT06'),
(2, 'CAT04'), (2, 'CAT02'),
(3, 'CAT05'),
(4, 'CAT04'), (4, 'CAT02'),
(5, 'CAT06'),
(6, 'CAT01'), (6, 'CAT02'),
(7, 'CAT02'), (7, 'CAT01'),
(8, 'CAT06'),
(9, 'CAT06'), (9, 'CAT07'),
(10, 'CAT07'),
(11, 'CAT07'),
(12, 'CAT02'),
(13, 'CAT01'),
(14, 'CAT10'),
(15, 'CAT10'), (15, 'CAT06'),
(16, 'CAT02'),
(17, 'CAT06'),
(18, 'CAT09'),
(19, 'CAT09'),
(20, 'CAT02'),
(21, 'CAT01'),
(22, 'CAT10'), (22, 'CAT06'),
(23, 'CAT01'),
(24, 'CAT07'),
(25, 'CAT08'),
(26, 'CAT06'),
(27, 'CAT08'),
(28, 'CAT06'), (28, 'CAT03'),
(29, 'CAT08'),
(30, 'CAT08');

-- =============================================
-- TABLE: BOOKCOPY - Import data (60 rows already exists)
-- =============================================
INSERT INTO BOOKCOPY (CopyID, BookID, Location, Status) VALUES
('CP001', 1, 'Shelf A1', 'Available'),
('CP002', 1, 'Shelf A1', 'Borrowed'),
('CP003', 2, 'Shelf A2', 'Available'),
('CP004', 2, 'Shelf A2', 'Available'),
('CP005', 3, 'Shelf A3', 'Available'),
('CP006', 3, 'Shelf A3', 'Borrowed'),
('CP007', 4, 'Shelf A4', 'Available'),
('CP008', 4, 'Shelf A4', 'Available'),
('CP009', 5, 'Shelf B1', 'Available'),
('CP010', 5, 'Shelf B1', 'Borrowed'),
('CP011', 6, 'Shelf B2', 'Available'),
('CP012', 6, 'Shelf B2', 'Available'),
('CP013', 7, 'Shelf B3', 'Available'),
('CP014', 7, 'Shelf B3', 'Available'),
('CP015', 8, 'Shelf B4', 'Available'),
('CP016', 8, 'Shelf B4', 'Borrowed'),
('CP017', 9, 'Shelf C1', 'Available'),
('CP018', 9, 'Shelf C1', 'Available'),
('CP019', 10, 'Shelf C2', 'Available'),
('CP020', 10, 'Shelf C2', 'Available'),
('CP021', 11, 'Shelf C3', 'Available'),
('CP022', 11, 'Shelf C3', 'Borrowed'),
('CP023', 12, 'Shelf C4', 'Available'),
('CP024', 12, 'Shelf C4', 'Available'),
('CP025', 13, 'Shelf D1', 'Available'),
('CP026', 13, 'Shelf D1', 'Borrowed'),
('CP027', 14, 'Shelf D2', 'Available'),
('CP028', 14, 'Shelf D2', 'Available'),
('CP029', 15, 'Shelf D3', 'Available'),
('CP030', 15, 'Shelf D3', 'Borrowed'),
('CP031', 16, 'Shelf D4', 'Available'),
('CP032', 16, 'Shelf D4', 'Available'),
('CP033', 17, 'Shelf E1', 'Available'),
('CP034', 17, 'Shelf E1', 'Borrowed'),
('CP035', 18, 'Shelf E2', 'Available'),
('CP036', 18, 'Shelf E2', 'Available'),
('CP037', 19, 'Shelf E3', 'Available'),
('CP038', 19, 'Shelf E3', 'Available'),
('CP039', 20, 'Shelf E4', 'Available'),
('CP040', 20, 'Shelf E4', 'Borrowed'),
('CP041', 21, 'Shelf F1', 'Available'),
('CP042', 21, 'Shelf F1', 'Available'),
('CP043', 22, 'Shelf F2', 'Available'),
('CP044', 22, 'Shelf F2', 'Borrowed'),
('CP045', 23, 'Shelf F3', 'Available'),
('CP046', 23, 'Shelf F3', 'Available'),
('CP047', 24, 'Shelf F4', 'Available'),
('CP048', 24, 'Shelf F4', 'Borrowed'),
('CP049', 25, 'Shelf G1', 'Available'),
('CP050', 25, 'Shelf G1', 'Available'),
('CP051', 26, 'Shelf G2', 'Available'),
('CP052', 26, 'Shelf G2', 'Borrowed'),
('CP053', 27, 'Shelf G3', 'Available'),
('CP054', 27, 'Shelf G3', 'Available'),
('CP055', 28, 'Shelf G4', 'Available'),
('CP056', 28, 'Shelf G4', 'Borrowed'),
('CP057', 29, 'Shelf H1', 'Available'),
('CP058', 29, 'Shelf H1', 'Available'),
('CP059', 30, 'Shelf H2', 'Available'),
('CP060', 30, 'Shelf H2', 'Available');

-- =============================================
-- TABLE: MEMBER - Import data (20 rows already exists)
-- =============================================
INSERT INTO MEMBER (MemberID, FullName, Email, Phone, Address, MemberType, CardIssueDate, Status) VALUES
('MB230001', 'Nguyễn Văn An', 'annguyen@gmail.com', '385123401', 'Hà Nội', 'Student', '2025-01-15', 'Active'),
('MB230002', 'Trần Thị Bình', 'tranthibinh@gmail.com', '796348205', 'TP. Hồ Chí Minh', 'Student', '2025-02-10', 'Active'),
('MB230003', 'Lê Minh Cường', 'leminhcuong@gmail.com', '867459213', 'Đà Nẵng', 'Student', '2025-03-05', 'Active'),
('MB230004', 'Phạm Thu Dung', 'phamthudung@gmail.com', '918734620', 'Hà Nội', 'Lecturer', '2025-03-20', 'Active'),
('MB230005', 'Hoàng Văn Đức', 'hoangvanduc@gmail.com', '704569821', 'Hải Phòng', 'Student', '2025-04-12', 'Inactive'),
('MB230006', 'Vũ Thị Hạnh', 'vuthihanh@gmail.com', '339845726', 'Nam Định', 'Student', '2025-05-01', 'Active'),
('MB230007', 'Đỗ Quang Huy', 'doquanghuy@gmail.com', '782154693', 'TP. Hồ Chí Minh', 'Student', '2025-05-18', 'Active'),
('MB230008', 'Nguyễn Thị Lan', 'nguyenthilan@gmail.com', '897364512', 'Hà Nội', 'Lecturer', '2025-06-07', 'Active'),
('MB230009', 'Trần Minh Long', 'tranminhlong@gmail.com', '965842371', 'Cần Thơ', 'Student', '2025-06-25', 'Active'),
('MB230010', 'Lê Thị Mai', 'lethimai@gmail.com', '321746985', 'Huế', 'Student', '2025-07-10', 'Active'),
('MB230011', 'Phan Quốc Nam', 'phanquocnam@gmail.com', '815639204', 'Bình Dương', 'Student', '2025-07-28', 'Active'),
('MB230012', 'Nguyễn Hoàng Phúc', 'nguyenhoangphuc@gmail.com', '974283651', 'TP. Hồ Chí Minh', 'Student', '2025-08-15', 'Active'),
('MB230013', 'Trịnh Thị Quỳnh', 'trinhthiquynh@gmail.com', '358624917', 'Hà Nội', 'Lecturer', '2025-09-01', 'Inactive'),
('MB230014', 'Bùi Văn Sơn', 'buivanson@gmail.com', '769452813', 'Nghệ An', 'Lecturer', '2025-09-20', 'Active'),
('MB230015', 'Đặng Thị Trang', 'dangthitrang@gmail.com', '852379640', 'Quảng Ninh', 'Student', '2025-10-05', 'Active'),
('MB230016', 'Võ Thanh Tùng', 'vothanhtung@gmail.com', '346185729', 'Khánh Hòa', 'Student', '2025-10-22', 'Active'),
('MB230017', 'Nguyễn Đức Thắng', 'nguyenducthang@gmail.com', '927546138', 'Thanh Hóa', 'Student', '2025-11-08', 'Active'),
('MB230018', 'Phạm Ngọc Anh', 'phamngocanh@gmail.com', '773918246', 'Hà Nội', 'Student', '2025-11-25', 'Active'),
('MB230019', 'Lương Thị Hồng', 'luongthihong@gmail.com', '884629751', 'Bắc Ninh', 'Lecturer', '2025-12-10', 'Active'),
('MB230020', 'Trần Quốc Bảo', 'tranquocbao@gmail.com', '392857416', 'Long An', 'Student', '2025-12-28', 'Active');

-- =============================================
-- TABLE: STAFF - Import data and add more to reach 20 rows
-- =============================================
INSERT INTO STAFF (StaffID, FullName, Email, Role, PasswordHash, ActiveFlag) VALUES
('ST001', 'Nguyễn Thị Hồng', 'hongnt@library.com', 'Librarian', 'HASH_ST001', TRUE),
('ST002', 'Trần Văn Minh', 'minhtv@library.com', 'Librarian', 'HASH_ST002', TRUE),
('ST003', 'Lê Thị Lan', 'lanlt@library.com', 'Assistant', 'HASH_ST003', TRUE),
('ST004', 'Đặng Thị Mai', 'maidt@library.com', 'Librarian', 'HASH_ST004', FALSE),
('ST005', 'Hoàng Minh Đức', 'duchm@library.com', 'Admin', 'HASH_ST005', TRUE),
('ST006', 'Phạm Văn Hùng', 'hungpv@library.com', 'Librarian', 'HASH_ST006', TRUE),
('ST007', 'Võ Thị Kim', 'kimvt@library.com', 'Assistant', 'HASH_ST007', TRUE),
('ST008', 'Đỗ Quang Nam', 'namdq@library.com', 'Librarian', 'HASH_ST008', TRUE),
('ST009', 'Bùi Thị Hương', 'huongbt@library.com', 'Librarian', 'HASH_ST009', TRUE),
('ST010', 'Nguyễn Văn Tài', 'tainv@library.com', 'Assistant', 'HASH_ST010', TRUE),
('ST011', 'Trần Thị Ngọc', 'ngoctt@library.com', 'Librarian', 'HASH_ST011', TRUE),
('ST012', 'Lê Văn Bình', 'binhlv@library.com', 'Admin', 'HASH_ST012', TRUE),
('ST013', 'Phạm Thị Linh', 'linhpt@library.com', 'Assistant', 'HASH_ST013', TRUE),
('ST014', 'Hoàng Văn Sơn', 'sonhv@library.com', 'Librarian', 'HASH_ST014', TRUE),
('ST015', 'Đặng Thị Hà', 'hadt@library.com', 'Librarian', 'HASH_ST015', TRUE),
('ST016', 'Vũ Văn Tuấn', 'tuanvv@library.com', 'Assistant', 'HASH_ST016', FALSE),
('ST017', 'Nguyễn Thị Thanh', 'thanhnt@library.com', 'Librarian', 'HASH_ST017', TRUE),
('ST018', 'Trần Văn Đức', 'ductv@library.com', 'Librarian', 'HASH_ST018', TRUE),
('ST019', 'Lê Thị Phương', 'phuonglt@library.com', 'Assistant', 'HASH_ST019', TRUE),
('ST020', 'Phan Văn Quang', 'quangpv@library.com', 'Admin', 'HASH_ST020', TRUE);

-- =============================================
-- TABLE: LOAN - Import data (20 rows already exists)
-- =============================================
INSERT INTO LOAN (LoanID, MemberID, CopyID, StaffID, LoanDate, DueDate, ReturnDate, Status) VALUES
('LD240001', 'MB230001', 'CP001', 'ST001', '2025-01-05', '2025-01-19', '2025-01-18', 'Returned'),
('LD240002', 'MB230002', 'CP002', 'ST002', '2025-01-06', '2025-01-20', '2025-01-22', 'Overdue'),
('LD240003', 'MB230003', 'CP003', 'ST003', '2025-01-07', '2025-01-22', '2025-01-21', 'Returned'),
('LD240004', 'MB230004', 'CP004', 'ST004', '2025-01-08', '2025-01-24', NULL, 'Borrowed'),
('LD240005', 'MB230005', 'CP005', 'ST005', '2025-01-09', '2025-01-26', '2025-02-01', 'Overdue'),
('LD240006', 'MB230006', 'CP006', 'ST001', '2025-01-10', '2025-01-28', '2024-01-27', 'Returned'),
('LD240007', 'MB230007', 'CP007', 'ST002', '2025-01-11', '2025-01-29', NULL, 'Borrowed'),
('LD240008', 'MB230008', 'CP008', 'ST003', '2025-01-12', '2025-01-31', '2025-01-30', 'Returned'),
('LD240009', 'MB230009', 'CP009', 'ST004', '2025-01-13', '2025-02-01', '2025-02-03', 'Overdue'),
('LD240010', 'MB230010', 'CP010', 'ST005', '2025-01-14', '2025-02-03', '2025-02-02', 'Returned'),
('LD240011', 'MB230011', 'CP011', 'ST001', '2025-01-15', '2025-02-05', NULL, 'Borrowed'),
('LD240012', 'MB230012', 'CP012', 'ST002', '2025-01-16', '2025-02-08', '2025-02-12', 'Overdue'),
('LD240013', 'MB230013', 'CP013', 'ST003', '2025-01-17', '2025-02-10', '2025-02-09', 'Returned'),
('LD240014', 'MB230014', 'CP014', 'ST004', '2025-01-18', '2025-02-11', NULL, 'Borrowed'),
('LD240015', 'MB230015', 'CP015', 'ST005', '2025-01-19', '2025-02-13', '2025-02-13', 'Returned'),
('LD240016', 'MB230016', 'CP016', 'ST001', '2025-01-20', '2025-02-15', '2025-02-14', 'Overdue'),
('LD240017', 'MB230017', 'CP017', 'ST002', '2025-01-21', '2025-02-16', NULL, 'Borrowed'),
('LD240018', 'MB230018', 'CP018', 'ST003', '2025-01-22', '2025-02-18', '2025-02-17', 'Returned'),
('LD240019', 'MB230019', 'CP019', 'ST004', '2025-01-23', '2025-02-19', NULL, 'Borrowed'),
('LD240020', 'MB230020', 'CP020', 'ST005', '2025-01-24', '2025-02-21', NULL, 'Borrowed');

-- =============================================
-- TABLE: RESERVATION - Import data (20 rows already exists)
-- =============================================
INSERT INTO RESERVATION (ReservationID, BookID, MemberID, ReserveDate, ExpireDate, MemberType, PositionInQueue, Status) VALUES
('RS260701', 1, 'MB230001', '2024-01-03', '2024-01-10', 'Student', 1, 'Fulfilled'),
('RS260702', 1, 'MB230002', '2024-01-04', '2024-01-11', 'Student', 2, 'Active'),
('RS260703', 2, 'MB230003', '2024-01-05', '2024-01-12', 'Student', 3, 'Active'),
('RS260704', 2, 'MB230004', '2024-01-06', '2024-01-13', 'Lecturer', 1, 'Expired'),
('RS260705', 3, 'MB230005', '2024-01-07', '2024-01-14', 'Student', 2, 'Cancelled'),
('RS260706', 3, 'MB230006', '2024-01-08', '2024-01-15', 'Student', 1, 'Fulfilled'),
('RS260707', 5, 'MB230007', '2024-01-09', '2024-01-16', 'Student', 2, 'Active'),
('RS260708', 5, 'MB230008', '2024-01-10', '2024-01-17', 'Lecturer', 1, 'Active'),
('RS260709', 8, 'MB230009', '2024-01-11', '2024-01-18', 'Student', 1, 'Expired'),
('RS260710', 9, 'MB230010', '2024-01-12', '2024-01-19', 'Student', 2, 'Active'),
('RS260711', 10, 'MB230011', '2024-01-13', '2024-01-20', 'Student', 1, 'Fulfilled'),
('RS260712', 11, 'MB230012', '2024-01-14', '2024-01-21', 'Student', 1, 'Active'),
('RS260713', 11, 'MB230013', '2024-01-15', '2024-01-22', 'Lecturer', 2, 'Active'),
('RS260714', 12, 'MB230014', '2024-01-16', '2024-01-23', 'Lecturer', 1, 'Fulfilled'),
('RS260715', 12, 'MB230015', '2024-01-17', '2024-01-24', 'Student', 1, 'Expired'),
('RS260716', 19, 'MB230016', '2024-01-18', '2024-01-25', 'Student', 1, 'Fulfilled'),
('RS260717', 20, 'MB230017', '2024-01-19', '2024-01-26', 'Student', 1, 'Active'),
('RS260718', 24, 'MB230018', '2024-01-20', '2024-01-27', 'Student', 2, 'Active'),
('RS260719', 28, 'MB230019', '2024-01-21', '2024-01-28', 'Lecturer', 1, 'Fulfilled'),
('RS260720', 30, 'MB230020', '2024-01-22', '2024-01-29', 'Student', 1, 'Active');

-- =============================================
-- TABLE: SUPPLIER - Import data and add more to reach 20 rows
-- =============================================
INSERT INTO SUPPLIER (SupplierID, Name, Contact, Email, Phone, Address) VALUES
('SP20250101', 'Nhà Xuất Bản Giáo Dục Việt Nam', 'Nguyễn Văn Hùng', 'hung.nguyen@nxb.edu.vn', '903000001', 'Hà Nội'),
('SP20250102', 'Công ty CP Phát hành Sách TP.HCM (FAHASA)', 'Lê Minh Tuấn', 'tuan.le@fahasa.com', '903000003', 'TP. Hồ Chí Minh'),
('SP20250103', 'Nhà Xuất Bản Lao Động – Xã Hội', 'Nguyễn Thị Hạnh', 'hanh.nguyen@nxbldxh.vn', '903000005', 'Hà Nội'),
('SP20250104', 'Nhà Xuất Bản Thông tin và Truyền thông', 'Lê Quốc Khánh', 'khanh.le@nxbtttt.vn', '903000008', 'Hà Nội'),
('SP20250105', 'Công ty TNHH Sách Kinh tế Tri Thức', 'Nguyễn Minh Đức', 'duc.nguyen@trithucbooks.vn', '903000010', 'TP. Hồ Chí Minh'),
('SP20250106', 'Công ty CP Sách và Thiết bị Trường học TP.HCM', 'Trần Thị Lan', 'lan.tran@thietbitruonghoc.vn', '903000002', 'TP. Hồ Chí Minh'),
('SP20250107', 'Nhà Xuất Bản Thống Kê', 'Phạm Quang Dũng', 'dung.pham@nxbthongke.vn', '903000004', 'Hà Nội'),
('SP20250108', 'Nhà Xuất Bản Đại học Quốc gia Hà Nội', 'Trần Văn Nam', 'nam.tran@vnupress.vn', '903000011', 'Hà Nội'),
('SP20250109', 'Nhà Xuất Bản Tài chính', 'Lê Thị Thu', 'thu.le@nxbtc.vn', '903000012', 'Hà Nội'),
('SP20250110', 'Công ty Sách Alphabooks', 'Nguyễn Hữu Long', 'long.nguyen@alphabooks.vn', '903000013', 'TP. Hồ Chí Minh'),
('SP20250111', 'Nhà Xuất Bản Tổng hợp TP.HCM', 'Phạm Thị Mai', 'mai.pham@nxbhcm.com.vn', '903000014', 'TP. Hồ Chí Minh'),
('SP20250112', 'Công ty First News', 'Võ Văn Tâm', 'tam.vo@firstnews.com.vn', '903000015', 'TP. Hồ Chí Minh'),
('SP20250113', 'Nhà Xuất Bản Khoa học và Kỹ thuật', 'Đỗ Minh Hải', 'hai.do@nxbkhkt.vn', '903000016', 'Hà Nội'),
('SP20250114', 'Công ty Thái Hà Books', 'Bùi Văn Hùng', 'hung.bui@thaihabooks.com', '903000017', 'Hà Nội'),
('SP20250115', 'Nhà Xuất Bản Văn hóa – Văn nghệ', 'Trần Thị Hoa', 'hoa.tran@nxbvhvn.vn', '903000018', 'Hà Nội'),
('SP20250116', 'Công ty Nhã Nam', 'Nguyễn Quang Thạch', 'thach.nguyen@nhanam.vn', '903000019', 'Hà Nội'),
('SP20250117', 'Nhà Xuất Bản Thanh niên', 'Lê Văn Tuấn', 'tuan.le@nxbthanhnien.vn', '903000020', 'TP. Hồ Chí Minh'),
('SP20250118', 'Công ty Sách Đinh Tị', 'Phạm Minh Tuấn', 'tuan.pham@dinhtibooks.vn', '903000021', 'Hà Nội'),
('SP20250119', 'Nhà Xuất Bản Chính trị Quốc gia', 'Hoàng Văn Dũng', 'dung.hoang@nxbctqg.vn', '903000022', 'Hà Nội'),
('SP20250120', 'Công ty Sách Saigon Books', 'Võ Thị Lan', 'lan.vo@saigonbooks.vn', '903000023', 'TP. Hồ Chí Minh');

-- =============================================
-- TABLE: PURCHASEORDER - Import data and add more to reach 20 rows
-- =============================================
INSERT INTO PURCHASEORDER (POID, SupplierID, StaffID, OrderDate, ExpectedDate, Status) VALUES
('PO001', 'SP20250101', 'ST005', '2025-01-05', '2025-01-12', 'Pending'),
('PO002', 'SP20250103', 'ST001', '2025-01-08', '2025-01-15', 'Received'),
('PO003', 'SP20250105', 'ST002', '2025-01-10', '2025-01-18', 'Received'),
('PO004', 'SP20250107', 'ST003', '2025-01-15', '2025-01-19', 'Pending'),
('PO005', 'SP20250102', 'ST003', '2025-01-20', '2025-01-20', 'Cancelled'),
('PO006', 'SP20250104', 'ST005', '2025-02-01', '2025-01-21', 'Pending'),
('PO007', 'SP20250106', 'ST001', '2025-02-05', '2025-01-22', 'Received'),
('PO008', 'SP20250105', 'ST001', '2025-02-06', '2025-01-23', 'Pending'),
('PO009', 'SP20250101', 'ST003', '2025-02-07', '2025-01-24', 'Received'),
('PO010', 'SP20250113', 'ST002', '2025-02-08', '2025-01-25', 'Pending'),
('PO011', 'SP20250108', 'ST005', '2025-02-10', '2025-02-17', 'Received'),
('PO012', 'SP20250109', 'ST001', '2025-02-12', '2025-02-19', 'Pending'),
('PO013', 'SP20250110', 'ST002', '2025-02-14', '2025-02-21', 'Received'),
('PO014', 'SP20250111', 'ST003', '2025-02-16', '2025-02-23', 'Pending'),
('PO015', 'SP20250112', 'ST004', '2025-02-18', '2025-02-25', 'Received'),
('PO016', 'SP20250114', 'ST005', '2025-02-20', '2025-02-27', 'Pending'),
('PO017', 'SP20250115', 'ST001', '2025-02-22', '2025-03-01', 'Received'),
('PO018', 'SP20250116', 'ST002', '2025-02-24', '2025-03-03', 'Pending'),
('PO019', 'SP20250117', 'ST003', '2025-02-26', '2025-03-05', 'Received'),
('PO020', 'SP20250118', 'ST004', '2025-02-28', '2025-03-07', 'Pending');

-- =============================================
-- TABLE: PURCHASEORDER_DETAILS - Import data and add more to reach 20 rows
-- =============================================
INSERT INTO PURCHASEORDER_DETAILS (PODetailID, POID, BookID, Quantity, UnitPrice) VALUES
('POD001', 'PO001', 1, 10, 200000),
('POD002', 'PO001', 3, 5, 100000),
('POD003', 'PO003', 5, 8, 160000),
('POD004', 'PO003', 9, 4, 110000),
('POD005', 'PO005', 11, 12, 240000),
('POD006', 'PO005', 12, 9, 180000),
('POD007', 'PO006', 19, 11, 220000),
('POD008', 'PO009', 20, 24, 480000),
('POD009', 'PO009', 28, 15, 300000),
('POD010', 'PO010', 30, 2, 120000),
('POD011', 'PO011', 2, 15, 150000),
('POD012', 'PO012', 4, 10, 180000),
('POD013', 'PO013', 6, 20, 200000),
('POD014', 'PO014', 7, 12, 190000),
('POD015', 'PO015', 8, 18, 210000),
('POD016', 'PO016', 10, 14, 170000),
('POD017', 'PO017', 13, 16, 160000),
('POD018', 'PO018', 14, 22, 220000),
('POD019', 'PO019', 15, 19, 190000),
('POD020', 'PO020', 16, 25, 250000);

-- =============================================
-- TABLE: FINEPAYMENT - Import data and add more to reach 20 rows
-- =============================================
INSERT INTO FINEPAYMENT (PaymentID, LoanID, MemberID, Amount, PaymentDate, Method, Status) VALUES
('FP001', 'LD240002', 'MB230002', 50000, '2025-02-01', 'Cash', 'Paid'),
('FP002', 'LD240005', 'MB230005', 50000, '2025-02-10', 'BankTransfer', 'Paid'),
('FP003', 'LD240009', 'MB230009', 50000, '2025-02-14', 'Cash', 'Paid'),
('FP004', 'LD240012', 'MB230012', 50000, '2025-02-16', 'BankTransfer', 'Paid'),
('FP005', 'LD240016', 'MB230016', 50000, '2025-02-18', 'E-Wallet', 'Paid'),
('FP006', 'LD240002', 'MB230002', 30000, '2025-02-22', 'Cash', 'Paid'),
('FP007', 'LD240005', 'MB230005', 40000, '2025-02-25', 'BankTransfer', 'Paid'),
('FP008', 'LD240009', 'MB230009', 35000, '2025-02-27', 'E-Wallet', 'Paid'),
('FP009', 'LD240012', 'MB230012', 45000, '2025-03-01', 'Cash', 'Paid'),
('FP010', 'LD240016', 'MB230016', 55000, '2025-03-03', 'BankTransfer', 'Paid'),
('FP011', 'LD240002', 'MB230002', 25000, '2025-03-05', 'E-Wallet', 'Paid'),
('FP012', 'LD240005', 'MB230005', 30000, '2025-03-07', 'Cash', 'Paid'),
('FP013', 'LD240009', 'MB230009', 40000, '2025-03-09', 'BankTransfer', 'Paid'),
('FP014', 'LD240012', 'MB230012', 35000, '2025-03-11', 'E-Wallet', 'Paid'),
('FP015', 'LD240016', 'MB230016', 50000, '2025-03-13', 'Cash', 'Paid'),
('FP016', 'LD240002', 'MB230002', 45000, '2025-03-15', 'BankTransfer', 'Paid'),
('FP017', 'LD240005', 'MB230005', 55000, '2025-03-17', 'E-Wallet', 'Paid'),
('FP018', 'LD240009', 'MB230009', 60000, '2025-03-19', 'Cash', 'Paid'),
('FP019', 'LD240012', 'MB230012', 40000, '2025-03-21', 'BankTransfer', 'Paid'),
('FP020', 'LD240016', 'MB230016', 35000, '2025-03-23', 'E-Wallet', 'Paid');

-- =============================================
-- TABLE: LOSTREPORT - Import data and add more to reach 20 rows
-- =============================================
INSERT INTO LOSTREPORT (ReportID, LoanID, CopyID, MemberID, ReportDate, CompensationAmount, Status) VALUES
('LR001', 'LD240004', 'CP004', 'MB230004', '2025-02-06', 350000, 'Compensated'),
('LR002', 'LD240007', 'CP007', 'MB230007', '2025-02-11', 420000, 'Reported'),
('LR003', 'LD240011', 'CP011', 'MB230011', '2025-02-15', 300000, 'Compensated'),
('LR004', 'LD240012', 'CP012', 'MB230012', '2025-02-19', 500000, 'Reported'),
('LR005', 'LD240014', 'CP014', 'MB230014', '2025-02-25', 380000, 'Reported'),
('LR006', 'LD240016', 'CP016', 'MB230016', '2025-02-28', 320000, 'Compensated'),
('LR007', 'LD240017', 'CP017', 'MB230017', '2025-03-02', 410000, 'Reported'),
('LR008', 'LD240019', 'CP019', 'MB230019', '2025-03-05', 360000, 'Compensated'),
('LR009', 'LD240020', 'CP020', 'MB230020', '2025-03-08', 390000, 'Reported'),
('LR010', 'LD240004', 'CP004', 'MB230004', '2025-03-10', 340000, 'Reported'),
('LR011', 'LD240007', 'CP007', 'MB230007', '2025-03-12', 430000, 'Compensated'),
('LR012', 'LD240011', 'CP011', 'MB230011', '2025-03-14', 310000, 'Reported'),
('LR013', 'LD240014', 'CP014', 'MB230014', '2025-03-16', 370000, 'Compensated'),
('LR014', 'LD240017', 'CP017', 'MB230017', '2025-03-18', 400000, 'Reported'),
('LR015', 'LD240019', 'CP019', 'MB230019', '2025-03-20', 350000, 'Compensated'),
('LR016', 'LD240020', 'CP020', 'MB230020', '2025-03-22', 380000, 'Reported'),
('LR017', 'LD240004', 'CP004', 'MB230004', '2025-03-24', 360000, 'Compensated'),
('LR018', 'LD240007', 'CP007', 'MB230007', '2025-03-26', 440000, 'Reported'),
('LR019', 'LD240011', 'CP011', 'MB230011', '2025-03-28', 320000, 'Compensated'),
('LR020', 'LD240014', 'CP014', 'MB230014', '2025-03-30', 390000, 'Reported');

-- =============================================
-- TABLE: AUDITLOG - Import data and add more to reach 20 rows
-- =============================================
INSERT INTO AUDITLOG (LogID, StaffID, Action, TableName, RecordID, Timestamp, Details) VALUES
('AL001', 'ST005', 'CREATE', 'PurchaseOrder', 1, '2024-01-05 09:15:00', 'Create a book order'),
('AL002', 'ST001', 'UPDATE', 'PurchaseOrder', 2, '2024-01-08 14:30:00', 'Update status'),
('AL003', 'ST002', 'CREATE', 'Loan', 3, '2024-01-10 10:05:00', 'Create a loan'),
('AL004', 'ST005', 'UPDATE', 'Loan', 4, '2024-01-12 16:40:00', 'Create a loan'),
('AL005', 'ST003', 'CREATE', 'FinePayment', 1, '2024-02-01 11:20:00', 'Record payment'),
('AL006', 'ST001', 'UPDATE', 'Member', 5, '2024-02-05 08:55:00', 'Update members'),
('AL007', 'ST005', 'DELETE', 'Reservation', 3, '2024-02-10 15:10:00', 'Cancel reservation'),
('AL008', 'ST002', 'LOGIN', 'System', 0, '2024-02-15 08:00:00', 'Log in to the system'),
('AL009', 'ST001', 'LOGOUT', 'System', 0, '2024-02-15 17:00:00', 'Log out to the system'),
('AL010', 'ST005', 'UPDATE', 'LostReport', 2, '2024-02-18 13:45:00', 'Update the lost'),
('AL011', 'ST003', 'CREATE', 'Book', 25, '2024-02-20 09:30:00', 'Add new book to collection'),
('AL012', 'ST002', 'UPDATE', 'BookCopy', 15, '2024-02-22 11:15:00', 'Update copy status'),
('AL013', 'ST001', 'CREATE', 'Member', 21, '2024-02-24 14:20:00', 'Register new member'),
('AL014', 'ST004', 'DELETE', 'Reservation', 5, '2024-02-26 10:45:00', 'Cancel expired reservation'),
('AL015', 'ST005', 'CREATE', 'Supplier', 8, '2024-02-28 15:30:00', 'Add new supplier'),
('AL016', 'ST002', 'UPDATE', 'Staff', 4, '2024-03-01 08:20:00', 'Update staff status'),
('AL017', 'ST003', 'CREATE', 'Loan', 21, '2024-03-03 13:40:00', 'Process new loan'),
('AL018', 'ST001', 'UPDATE', 'FinePayment', 6, '2024-03-05 16:10:00', 'Record fine payment'),
('AL019', 'ST005', 'CREATE', 'PurchaseOrder', 11, '2024-03-07 09:50:00', 'Create purchase order'),
('AL020', 'ST002', 'UPDATE', 'Book', 12, '2024-03-09 14:25:00', 'Update book information');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- BUSINESS QUESTIONS AND REPORTS
-- =============================================

-- =============================================
-- QUESTION 1: Popular Books Analysis
-- Question: Find books that have been borrowed more than twice, showing their
-- borrowing count, status breakdown, and availability.
-- SQL Concepts: JOIN, GROUP BY, HAVING, CASE, Aggregate Functions, ORDER BY
-- =============================================

SELECT 
    B.BookID,
    B.Title,
    B.Publisher,
    COUNT(L.LoanID) AS TotalLoans,
    COUNT(CASE WHEN L.Status = 'Returned' THEN 1 END) AS ReturnedLoans,
    COUNT(CASE WHEN L.Status = 'Borrowed' THEN 1 END) AS CurrentLoans,
    COUNT(CASE WHEN BC.Status = 'Available' THEN 1 END) AS AvailableCopies,
    COUNT(BC.CopyID) AS TotalCopies
FROM BOOK B
INNER JOIN BOOKCOPY BC ON B.BookID = BC.BookID
INNER JOIN LOAN L ON BC.CopyID = L.CopyID
GROUP BY B.BookID, B.Title, B.Publisher
HAVING COUNT(L.LoanID) > 2
ORDER BY TotalLoans DESC, AvailableCopies ASC;

-- =============================================
-- QUESTION 2: Member Financial Status View
-- Question: Create a VIEW to show member borrowing and payment information,
-- then query members with outstanding activity.
-- SQL Concepts: VIEW, SELECT, JOIN, GROUP BY, CASE, WHERE, ORDER BY
-- =============================================

CREATE OR REPLACE VIEW vw_MemberStatus AS
SELECT 
    M.MemberID,
    M.FullName,
    M.Email,
    M.MemberType,
    COUNT(DISTINCT L.LoanID) AS TotalLoans,
    COUNT(DISTINCT CASE WHEN L.Status = 'Borrowed' THEN L.LoanID END) AS ActiveLoans,
    COUNT(DISTINCT FP.PaymentID) AS PaymentCount,
    COALESCE(SUM(FP.Amount), 0) AS TotalAmountPaid,
    CASE 
        WHEN COUNT(DISTINCT CASE WHEN L.Status = 'Borrowed' THEN L.LoanID END) > 2 THEN 'Heavy User'
        WHEN COUNT(DISTINCT CASE WHEN L.Status = 'Borrowed' THEN L.LoanID END) > 0 THEN 'Regular User'
        ELSE 'Inactive'
    END AS UserType
FROM MEMBER M
LEFT JOIN LOAN L ON M.MemberID = L.MemberID
LEFT JOIN FINEPAYMENT FP ON M.MemberID = FP.MemberID
GROUP BY M.MemberID, M.FullName, M.Email, M.MemberType;

-- Query the view to find active users
SELECT * FROM vw_MemberStatus
WHERE UserType IN ('Heavy User', 'Regular User')
ORDER BY ActiveLoans DESC, TotalAmountPaid DESC;

-- =============================================
-- QUESTION 3: Purchase Order and Supplier Performance Report
-- Question: Show supplier performance with order count, delivery status,
-- and identify suppliers with pending orders.
-- SQL Concepts: JOIN, GROUP BY, HAVING, CASE, WHERE, ORDER BY, Aggregate Functions
-- =============================================

SELECT 
    S.SupplierID,
    S.Name,
    S.Contact,
    S.Phone,
    COUNT(DISTINCT PO.POID) AS TotalOrders,
    COUNT(CASE WHEN PO.Status = 'Received' THEN 1 END) AS ReceivedOrders,
    COUNT(CASE WHEN PO.Status = 'Pending' THEN 1 END) AS PendingOrders,
    COUNT(CASE WHEN PO.Status = 'Cancelled' THEN 1 END) AS CancelledOrders,
    ROUND(COUNT(CASE WHEN PO.Status = 'Received' THEN 1 END) * 100.0 / 
          COUNT(DISTINCT PO.POID), 1) AS DeliveryRate,
    CASE 
        WHEN COUNT(CASE WHEN PO.Status = 'Received' THEN 1 END) * 100.0 / COUNT(DISTINCT PO.POID) >= 80 THEN 'Excellent'
        WHEN COUNT(CASE WHEN PO.Status = 'Received' THEN 1 END) * 100.0 / COUNT(DISTINCT PO.POID) >= 60 THEN 'Good'
        ELSE 'Needs Improvement'
    END AS SupplierRating
FROM SUPPLIER S
LEFT JOIN PURCHASEORDER PO ON S.SupplierID = PO.SupplierID
GROUP BY S.SupplierID, S.Name, S.Contact, S.Phone
HAVING COUNT(DISTINCT PO.POID) > 0
ORDER BY DeliveryRate DESC, TotalOrders DESC;

-- =============================================
-- QUESTION 4: Book Return Processing with Audit Logging
-- Question: Create a TRANSACTION to process book returns and update inventory,
-- demonstrating multi-step DML operations with rollback capability.
-- SQL Concepts: TRANSACTION, BEGIN, COMMIT, UPDATE, INSERT, SELECT, JOIN
-- =============================================

-- Example: Process a book return transaction
START TRANSACTION;

-- Step 1: Record the return in LOAN table
UPDATE LOAN
SET ReturnDate = CURRENT_DATE,
    Status = 'Returned'
WHERE LoanID = 'LD240004' AND Status = 'Borrowed';

-- Step 2: Update book copy status back to Available
UPDATE BOOKCOPY
SET Status = 'Available'
WHERE CopyID = (SELECT CopyID FROM LOAN WHERE LoanID = 'LD240004');

INSERT INTO AUDITLOG (LogID, StaffID, Action, TableName, RecordID, Timestamp, Details)
SELECT 
    CONCAT('AL', SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8)) AS LogID,
    'ST001',
    'UPDATE',
    'Loan',
    4,
    CURRENT_TIMESTAMP,
    CONCAT('Book returned successfully. LoanID: LD240004, ReturnDate: ', CURRENT_DATE);

COMMIT;

-- Verify the return transaction
SELECT 
    'Book Return Processed' AS TransactionStatus,
    L.LoanID,
    L.MemberID,
    B.Title,
    L.LoanDate,
    L.ReturnDate,
    L.Status AS LoanStatus,
    BC.Status AS CopyStatus
FROM LOAN L
INNER JOIN BOOKCOPY BC ON L.CopyID = BC.CopyID
INNER JOIN BOOK B ON BC.BookID = B.BookID
WHERE L.LoanID = 'LD240004';

-- =============================================
-- QUESTION 5: Reservation Fulfillment Transaction
-- Question: Complete transaction to fulfill a reservation by creating a loan,
-- updating statuses, and notifying the next person in queue.
-- SQL Concepts: TRANSACTION, BEGIN, COMMIT, INSERT, UPDATE, SELECT, JOIN, WHERE
-- =============================================

-- Example: Fulfill a reservation with complete transaction
START TRANSACTION;

-- Step 1: Create a new loan for the reserved book
INSERT INTO LOAN (LoanID, MemberID, CopyID, StaffID, LoanDate, DueDate, Status)
VALUES (
    'LD260122',
    'MB230008',
    'CP009',
    'ST001',
    CURRENT_DATE,
    DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY),
    'Borrowed'
);

-- Step 2: Update book copy status to Borrowed
UPDATE BOOKCOPY
SET Status = 'Borrowed'
WHERE CopyID = 'CP009';

-- Step 3: Update the reservation status to Fulfilled
UPDATE RESERVATION
SET Status = 'Fulfilled'
WHERE ReservationID = 'RS260708';

-- Step 4: Move the next person in queue to position 1
UPDATE RESERVATION
SET PositionInQueue = PositionInQueue - 1
WHERE BookID = 5 AND Status = 'Active' AND PositionInQueue > 1;

-- Step 5: Log the transaction in audit log
INSERT INTO AUDITLOG (LogID, StaffID, Action, TableName, RecordID, Timestamp, Details)
VALUES (
    'AL025',
    'ST001',
    'CREATE',
    'Loan',
    22,
    CURRENT_TIMESTAMP,
    'Reservation fulfilled: RS260708 converted to Loan LD260122'
);

COMMIT;

-- Verify the transaction results
SELECT 
    'Reservation Fulfilled' AS TransactionType,
    L.LoanID,
    M.FullName,
    B.Title,
    L.LoanDate,
    L.DueDate,
    R.Status AS ReservationStatus
FROM LOAN L
INNER JOIN MEMBER M ON L.MemberID = M.MemberID
INNER JOIN BOOKCOPY BC ON L.CopyID = BC.CopyID
INNER JOIN BOOK B ON BC.BookID = B.BookID
INNER JOIN RESERVATION R ON B.BookID = R.BookID AND R.ReservationID = 'RS260708'
WHERE L.LoanID = 'LD260122';

-- =============================================
-- End of Data Import
-- =============================================