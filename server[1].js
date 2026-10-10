const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Todo Task Manager server is running"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Todo Task Manager running at http://localhost:${PORT}`);
});