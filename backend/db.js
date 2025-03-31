import { config } from "dotenv";
import pg from "pg";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

config();
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const caCert = fs.readFileSync(`${__dirname}/ap-south-1-bundle.pem`).toString();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
  max: 10,
  idleTimeoutMillis: 30000,
  query_timeout: 50000,
  connectionTimeoutMillis: 60000,
  keepAlive: true,
  // ssl: { rejectUnauthorized: false, ca: caCert }, // Uncomment if needed
});

pool.on("connect", async () => {
  console.log("Connected to the PostgreSQL database!");
  try {
    await pool.query("SELECT * FROM users");
  } catch (err) {
    console.error("Database query error:", err);
  }
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
    client.release();
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

const query = (text, params) => pool.query(text, params);

export { query, pool };
