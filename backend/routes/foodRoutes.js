const express = require("express");
const router = express.Router();
const Food = require("../models/Food");

// Lấy danh sách món ăn
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thêm món ăn
router.post("/", async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cập nhật món ăn
router.put("/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({ message: "Không tìm thấy món ăn" });
    }

    res.json(food);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Xóa món ăn
router.delete("/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Không tìm thấy món ăn" });
    }

    res.json({ message: "Đã xóa món ăn thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
