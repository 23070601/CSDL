-- Test Notifications
-- First, get the first member ID
INSERT INTO NOTIFICATION (NotificationID, MemberID, Type, Title, Message, IsRead, CreatedAt)
SELECT 
  'NOT001',
  MemberID,
  'info',
  'Welcome',
  'Welcome to the Library Management System',
  false,
  NOW()
FROM MEMBER
LIMIT 1;

-- Add more test notifications for the same member
INSERT INTO NOTIFICATION (NotificationID, MemberID, Type, Title, Message, IsRead, CreatedAt)
SELECT 
  'NOT002',
  MemberID,
  'alert',
  'Overdue Books',
  'You have 2 overdue books. Please return them soon.',
  false,
  DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM MEMBER
LIMIT 1;

INSERT INTO NOTIFICATION (NotificationID, MemberID, Type, Title, Message, IsRead, CreatedAt)
SELECT 
  'NOT003',
  MemberID,
  'success',
  'Reservation Ready',
  'A reserved book is ready for pickup!',
  true,
  DATE_SUB(NOW(), INTERVAL 3 DAY)
FROM MEMBER
LIMIT 1;

INSERT INTO NOTIFICATION (NotificationID, MemberID, Type, Title, Message, IsRead, CreatedAt)
SELECT 
  'NOT004',
  MemberID,
  'warning',
  'Fine Payment Due',
  'You have an outstanding fine. Please make payment.',
  false,
  DATE_SUB(NOW(), INTERVAL 5 DAY)
FROM MEMBER
LIMIT 1;
