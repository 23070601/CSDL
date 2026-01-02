require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');

// 1. Kết nối database
async function connectDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
    console.log("Connected to database");
    return connection;
}

// 2. Hash password
const bcrypt = require('bcrypt');
async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, 10);
}

// 3. Tạo demo user
async function createDemoUser(username, password) {
    const hashed = await hashPassword(password);
    const connection = await connectDB();
    await connection.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashed]
    );
    console.log("User created with hashed password");
    connection.end();
    logAction(username, "Created demo user");
}

// 4. RBAC middleware demo (giả lập)
function authorize(allowedRoles, userRole) {
    if (!allowedRoles.includes(userRole)) {
        console.log("Access denied for role:", userRole);
        return false;
    }
    console.log("Access granted for role:", userRole);
    return true;
}

// 5. Audit Logging
function logAction(user, action) {
    const logEntry = `${new Date().toISOString()} | User: ${user} | ${action}\n`;
    fs.appendFileSync('audit.log', logEntry);
}

// Demo chạy
(async () => {
    await createDemoUser("demoUser", "UserPlainPassword123");

    // Demo RBAC
    authorize(['admin', 'librarian'], 'patron'); // denied
    authorize(['admin', 'librarian'], 'admin');  // granted
})();
