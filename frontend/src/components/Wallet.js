
const fetchWalletBalance = async () => {
  const token = localStorage.getItem("jwt");
  if (!token) return;

  try {
    const response = await axios.get("http://localhost:5000/wallet/balance", {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log(response.data);
  } catch (error) {
    console.error("Failed to fetch wallet balance:", error);
  }
}
