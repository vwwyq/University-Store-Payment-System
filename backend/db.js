const { Pool } = require("pg");
//const fs = require('fs');
require("dotenv").config();

//const caCert = fs.readFileSync('ap-south-1-bundle.pem').toString();

const pool = new Pool({
  user: process.env.DB_USER,
  //ssl: { rejectUnauthorized: false },
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
  max: 10,
  idleTimeoutMillis: 30000,
  query_timeout: 50000,
  connectionTimeoutMillis: 60000,
  keepAlive: true,
});

pool.on("connect", () => {
  console.log("Connected to the PostgreSQL database!");
  pool.query("SELECT * From users")
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
    console.log("Reconnecting to the database...");
  }
});

(async () => {
  try {
    console.log("Setting up initial db connection...");
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release()
    console.log("Database is ready");
  } catch (error) {
    console.error("Error setting up init db conn:", error);
  }
})();


setInterval(async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1"); // Ping the DB
    client.release();
  } catch (error) {
    console.error("Database Keep-Alive Error:", error);
  }
}, 30000);

module.exports = pool;
