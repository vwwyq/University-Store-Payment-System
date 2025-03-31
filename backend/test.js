const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://localhost:5000"; // Change if needed
const TOKEN_FILE = path.join(__dirname, "token.txt");

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: "test2@example.com", // Change this
      password: "password123", // Change this
    });

    const token = response.data.jwt;
    fs.writeFileSync(TOKEN_FILE, token);
    console.log("Token saved!");
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
  }
}

function getToken() {
  if (fs.existsSync(TOKEN_FILE)) {
    return fs.readFileSync(TOKEN_FILE, "utf-8").trim();
  }
  return null;
}

async function makeRequest(endpoint, method = "GET", data = {}) {
  const token = getToken();
  if (!token) {
    console.error("No token found. Please log in first.");
    return;
  }

  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
    };
    if (method !== "GET") config.data = data;

    const response = await axios(config);
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Request failed:", error.response?.data || error.message);
  }
}

// Usage examples:
(async () => {
  await login(); // Run this once to get the token

  await makeRequest("/wallet/topup", "POST", { amount: 500 }); // Top up wallet
  await makeRequest("/wallet/topup", "POST", { amount: 500 }); // Top up wallet
  await makeRequest("/wallet/pay", "POST", { amount: 300 }); // Top up wallet
  await makeRequest("/wallet/balance"); // Check balance
  await makeRequest("/wallet/history");
})();
