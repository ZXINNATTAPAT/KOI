const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3500;

// คีย์ลับสำหรับการสร้าง JWT
const JWT_SECRET = 'Creation of the divine power of oneself';
const REFRESH_TOKEN_SECRET = 'your_refresh_token_secret_key';

// เชื่อมต่อกับ PostgreSQL
const pool = new Pool({
  host: 'localhost',
  database: 'NewDB',
  user: 'postgres',  
  password: 'admin123',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware สำหรับตรวจสอบ JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).send('Access denied');

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

// POST: ลงทะเบียนผู้ใช้ใหม่ (Register)
app.post('/api/register', async (req, res) => {
  const { email, first_name, last_name, tel, birthday, password } = req.body;

  // ตรวจสอบว่ามีการกรอกข้อมูลครบถ้วนหรือไม่
  if (!email || !first_name || !last_name || !tel || !birthday || !password) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  try {
    // ตรวจสอบว่าผู้ใช้อีเมลนี้มีอยู่ในระบบแล้วหรือไม่
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกข้อมูลผู้ใช้ลงฐานข้อมูล
    const result = await pool.query(
      'INSERT INTO users (email, first_name, last_name, tel, birthday, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, first_name, last_name, tel, birthday, hashedPassword]
    );

    const newUser = result.rows[0];

    // สร้าง JWT Token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: '1h' } // กำหนดเวลาให้ JWT หมดอายุใน 1 ชั่วโมง
    );

    // ส่งข้อมูลผู้ใช้และ JWT กลับไปให้ผู้ใช้
    res.status(201).json({
      message: 'User registered successfully',
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST: เข้าสู่ระบบ (Login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).send('User not found');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).send('Invalid password');

    // สร้าง Access Token และ Refresh Token
    const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    // บันทึก Refresh Token ในฐานข้อมูล
    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).send('Error logging in');
    console.log(error);
  }
});

// POST: ขอ Access Token ใหม่โดยใช้ Refresh Token
app.post('/api/token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).send('Refresh Token is required');

  try {
    const result = await pool.query('SELECT * FROM users WHERE refresh_token = $1', [token]);
    const user = result.rows[0];

    if (!user) return res.status(403).send('Invalid Refresh Token');

    jwt.verify(token, REFRESH_TOKEN_SECRET, (err, userData) => {
      if (err) return res.status(403).send('Invalid Refresh Token');

      const accessToken = jwt.sign({ id: userData.id, email: userData.email }, JWT_SECRET, { expiresIn: '15m' });
      res.status(200).json({ accessToken });
    });
  } catch (error) {
    res.status(500).send('Error refreshing token');
  }
});

// POST: ล็อกเอาต์ (ลบ Refresh Token)
app.post('/api/logout', async (req, res) => {
  const { token } = req.body;
  try {
    await pool.query('UPDATE users SET refresh_token = NULL WHERE refresh_token = $1', [token]);
    res.status(200).send('Logged out successfully');
  } catch (error) {
    res.status(500).send('Error logging out');
  }
});

// GET: ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบ (ปกป้องด้วย JWT middleware)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching user profile');
  }
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
