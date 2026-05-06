import express from 'express'
import pkg from 'pg'

const { Pool } = pkg
const app = express()

app.use(express.json())

// ✅ 防呆：確保環境變數存在
if (!process.env.DATABASE_URL_MYDB) {
  throw new Error('❌ DATABASE_URL_MYDB 沒設定（請到 Render → Environment 設定）')
}

if (!process.env.DATABASE_URL_ACCIDENT) {
  throw new Error('❌ DATABASE_URL_ACCIDENT 沒設定（請到 Render → Environment 設定）')
}

// ✅ Render 必須使用 SSL
const pool_mydb = new Pool({
  connectionString: process.env.DATABASE_URL_MYDB,
  ssl: {
    rejectUnauthorized: false
  }
})

const pool_accident = new Pool({
  connectionString: process.env.DATABASE_URL_ACCIDENT,
  ssl: {
    rejectUnauthorized: false
  }
})

// 測試
app.get('/', (req, res) => {
  res.send('API is running')
})

// accidents
app.get('/accidents', async (req, res) => {
  try {
    const result = await pool_accident.query(
      "select * from accident.table1_11301_11312_changhua_caseid"
    )
    res.json(result.rows)
  } catch (err) {
    console.error('accidents error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/init-db', async (req, res) => {
  try {
    await pool_mydb.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT
      );
    `);
    res.send('✅ 資料表建立成功！');
  } catch (err) {
    res.status(500).send('❌ 失敗：' + err.message);
  }
});

// users
app.get('/users', async (req, res) => {
  try {
    const result = await pool_mydb.query('SELECT * FROM users')
    res.json(result.rows)
  } catch (err) {
    console.error('users error:', err)
    res.status(500).json({ error: err.message })
  }
})

// 新增 user
app.post('/users', async (req, res) => {
  const { name, email } = req.body
  try {
    const result = await pool_mydb.query(
      'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *',
      [name, email]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('insert error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/check-db', async (req, res) => {
  try {
    const dbInfo = await pool_mydb.query(
      "SELECT current_database(), current_user, inet_server_addr();"
    )
    // 新增：列出目前資料庫所有的資料表
    const tables = await pool_mydb.query(
      "SELECT table_name FROM information_schema.tables;"
    )
    
    res.json({
      connection: dbInfo.rows[0],
      tables: tables.rows.map(t => t.table_name)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Render 會自動給 PORT
const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})