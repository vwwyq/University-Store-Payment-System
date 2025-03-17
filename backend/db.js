const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  ssl: {
    rejectUnauthorized: false // For local testing, for production use 'true' and proper CA
  },
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on("connect", () => {
  console.log("Connected to the PostgreSQL database!");
});
module.exports = pool;
