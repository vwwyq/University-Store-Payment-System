const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "usps_db",
  password: process.env.DB_PASSWORD || "totoro2003",
  port: process.env.DB_PORT || 5432,
});

pool.on("connect", () => {
    console.log("Connected to the PostgreSQL database!");
  });
module.exports = pool;
