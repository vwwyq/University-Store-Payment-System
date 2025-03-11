function userNotFoundError() {
  return res.status(404).json({ error: "User not found" })
}
