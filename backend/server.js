const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Kết nối API quản lý món ăn
const foodRoutes = require("./routes/foodRoutes");
app.use("/api/foods", foodRoutes);

// Kiểm tra backend
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running",
  });
});

// Kết nối MongoDB và khởi động server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Da ket noi MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server dang chay tai cong ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Loi ket noi MongoDB:", error.message);
    process.exit(1);
  });
