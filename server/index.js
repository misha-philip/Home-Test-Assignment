const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const { v4: uuidv4 } = require('uuid');

const PORT = 5000;
const DB_CONFIG = {
    host: process.env.DB_HOST || 'tidb', // Corresponds to docker service name
    user: 'root',
    password: '',
    database: 'exam_db', //Default TiDB database we created in init.sql
    port: 4000
};

log4js.configure({
    appenders: { 
        out: { type: 'stdout', layout: { type: 'dummy' } } // We will manually format JSON
    },
    categories: { default: { appenders: ['out'], level: 'info' } }
});
const logger = log4js.getLogger();

const logActivity = (userId, action, req) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        user_id: userId,
        action: action,
        ip_address: req.ip || req.connection.remoteAddress
    };
    // We use console.log to ensure it prints raw JSON to Docker logs
    console.log(JSON.stringify(logEntry)); 
};

const app = express();
app.use(cors());
app.use(bodyParser.json());

let pool;
async function connectDB() {
    try {
        pool = mysql.createPool(DB_CONFIG);
        await pool.query('SELECT 1');
        console.log('Connected to TiDB successfully');
    } catch (err) {
        console.error('TiDB Connection failed, retrying in 5s...', err.message);
        setTimeout(connectDB, 5000);
    }
}
connectDB();

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!pool) return res.status(500).json({ error: 'DB not ready' });

    try {
        //Validate User
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND password = ?', 
            [username, password]
        );

        if (users.length === 0) {
            logActivity('UNKNOWN', 'FAILED_LOGIN_ATTEMPT', req);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        //Generate & Store Token
        const token = uuidv4();
        await pool.query(
            'INSERT INTO access_tokens (user_id, token) VALUES (?, ?)', 
            [user.id, token]
        );

        //Log Activity
        logActivity(user.id, 'USER_LOGIN', req);

        res.json({ token, username: user.username });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

//Protected Route Test Token Header
app.get('/api/profile', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    //Validate token against DB
    const [rows] = await pool.query(
        'SELECT user_id FROM access_tokens WHERE token = ?', 
        [authHeader]
    );

    if (rows.length === 0) return res.status(403).json({ error: 'Invalid token' });

    res.json({ message: `Access granted for User ID: ${rows[0].user_id}` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));