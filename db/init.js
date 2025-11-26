const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'mybudget.db');

// Check if database already exists
const dbExists = fs.existsSync(dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

// Read and execute SQL schema
const schemaPath = path.join(__dirname, 'init.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema into individual statements and execute them
const statements = schema.split(';').filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));

let completed = 0;
const total = statements.length;

statements.forEach((statement, index) => {
    db.run(statement.trim(), (err) => {
        if (err) {
            console.error(`Error executing statement ${index + 1}:`, err.message);
            console.error('Statement:', statement);
        } else {
            completed++;
        if (completed === total) {
            console.log('Database initialization completed successfully!');
            console.log('Please register an admin account through the web interface.');
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed.');
                    process.exit(0);
                }
            });
        }
        }
    });
});


