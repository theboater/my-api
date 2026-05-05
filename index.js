import express from 'express'
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg
const app = express()

app.use(express.json())

const pool_mydb = new Pool({
  connectionString: process.env.DATABASE_URL_MYDB
})

const pool_accident = new Pool({
  connectionString: process.env.DATABASE_URL_ACCIDENT
})

// 測試用
app.get('/', (req, res) => {
  res.send('API is running')
})

// accidents
app.get('/accidents', async (req, res) => {
  try {
    const result = await pool_accident.query(
      "select * from highway_accident_high_risk.table1_11301_11312 where city = '彰化縣'"
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// users
app.get('/users', async (req, res) => {
  try {
    const result = await pool_mydb.query('SELECT * FROM users')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
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
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// ✅ Render 必備
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})