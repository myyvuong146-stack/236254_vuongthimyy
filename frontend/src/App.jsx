import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/foods";

const emptyForm = {
  foodId: "",
  name: "",
  category: "Món chính",
  cuisine: "",
  ingredients: "",
  price: "",
  quantity: "0",
  description: "",
  imageUrl: "",
};

function App() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);

  async function loadFoods(keyword = search) {
    setLoading(true);
    setError("");

    try {
      const url = new URL(API_URL);
      if (keyword.trim()) url.searchParams.set("search", keyword.trim());

      const response = await fetch(url);
      if (!response.ok) throw new Error("Không tải được danh sách món ăn.");

      const data = await response.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Không kết nối được backend. Hãy kiểm tra server.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods("");
    // Chỉ tải danh sách khi mở trang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.foodId.trim() || !form.name.trim() || form.price === "") {
      setError("Vui lòng nhập mã món ăn, tên món ăn và giá.");
      return;
    }

    if (Number(form.price) < 0 || !Number.isFinite(Number(form.price))) {
      setError("Giá phải là số không âm.");
      return;
    }

    if (Number(form.quantity) < 0 || !Number.isFinite(Number(form.quantity))) {
      setError("Số lượng phải là số không âm.");
      return;
    }

    const payload = {
      ...form,
      foodId: form.foodId.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không lưu được món ăn.");
      }

      setNotice(
        editingId ? "Cập nhật món ăn thành công!" : "Thêm món ăn thành công!",
      );
      resetForm();
      await loadFoods();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi lưu món ăn.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(food) {
    setEditingId(food._id);
    setSelectedFood(null);
    setError("");
    setNotice("");

    setForm({
      foodId: food.foodId || "",
      name: food.name || "",
      category: food.category || "Khác",
      cuisine: food.cuisine || "",
      ingredients: Array.isArray(food.ingredients)
        ? food.ingredients.join(", ")
        : "",
      price: String(food.price ?? ""),
      quantity: String(food.quantity ?? 0),
      description: food.description || "",
      imageUrl: food.imageUrl || food.image || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(food) {
    const confirmed = window.confirm(
      `Em có chắc muốn xóa món "${food.name}" không?`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${food._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không xóa được món ăn.");
      }

      setNotice("Đã xóa món ăn thành công!");
      if (selectedFood?._id === food._id) setSelectedFood(null);
      await loadFoods();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi xóa món ăn.");
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadFoods(search);
  }

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-icon">🍜</div>
        <p className="eyebrow">FOOD MANAGEMENT SYSTEM</p>
        <h1>Quản lý món ăn</h1>
        <p>Quản lý thực đơn dễ dàng với React, Node.js và MongoDB.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FOOD INFORMATION</p>
              <h2>{editingId ? "Cập nhật món ăn" : "Thêm món ăn mới"}</h2>
            </div>
            {editingId && (
              <button
                className="secondary-button"
                type="button"
                onClick={resetForm}
              >
                Hủy sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Mã món ăn *
                <input
                  name="foodId"
                  value={form.foodId}
                  onChange={handleChange}
                  placeholder="VD: FOOD001"
                  required
                />
              </label>

              <label>
                Tên món ăn *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="VD: Phở bò"
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Giá (VNĐ) *
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="VD: 50000"
                  required
                />
              </label>

              <label>
                Số lượng
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Danh mục
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Món chính</option>
                  <option>Món khai vị</option>
                  <option>Đồ uống</option>
                  <option>Tráng miệng</option>
                  <option>Khác</option>
                </select>
              </label>

              <label>
                Ẩm thực
                <input
                  name="cuisine"
                  value={form.cuisine}
                  onChange={handleChange}
                  placeholder="VD: Việt Nam"
                />
              </label>
            </div>

            <label>
              Nguyên liệu
              <input
                name="ingredients"
                value={form.ingredients}
                onChange={handleChange}
                placeholder="Phở, thịt bò, hành lá (phân cách bằng dấu phẩy)"
              />
            </label>

            <label>
              Đường dẫn hình ảnh
              <input
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/food.jpg"
              />
            </label>

            <label>
              Mô tả
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn về món ăn..."
                rows="3"
              />
            </label>

            {form.imageUrl && (
              <div className="image-preview">
                <img
                  src={form.imageUrl}
                  alt="Xem trước món ăn"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <button className="primary-button" type="submit" disabled={saving}>
              {saving
                ? "Đang lưu..."
                : editingId
                  ? "Lưu thay đổi"
                  : "＋ Thêm món ăn"}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR MENU</p>
              <h2>Danh sách món ăn</h2>
            </div>
            <span className="count">{foods.length} món</span>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, danh mục hoặc ẩm thực..."
              aria-label="Tìm kiếm món ăn"
            />
            <button className="primary-button" type="submit">
              Tìm kiếm
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setSearch("");
                loadFoods("");
              }}
            >
              Xóa lọc
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
          {notice && <p className="success-message">{notice}</p>}

          {loading ? (
            <p className="empty-state">Đang tải danh sách món ăn...</p>
          ) : foods.length === 0 ? (
            <p className="empty-state">
              Chưa có món ăn phù hợp. Em có thể thêm món mới bằng biểu mẫu phía
              trên.
            </p>
          ) : (
            <div className="food-grid">
              {foods.map((food) => (
                <article className="food-card" key={food._id}>
                  {food.imageUrl || food.image ? (
                    <img
                      className="food-image"
                      src={food.imageUrl || food.image}
                      alt={food.name}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="food-placeholder">🍲</div>
                  )}

                  <div className="food-card-body">
                    <span className="category-tag">
                      {food.category || "Khác"}
                    </span>
                    <h3>{food.name}</h3>
                    <p className="food-description">
                      {food.description || "Chưa có mô tả"}
                    </p>
                    <p className="food-price">
                      {Number(food.price).toLocaleString("vi-VN")} ₫
                    </p>
                    <p className="food-meta">
                      Mã: {food.foodId || "Chưa cập nhật"} · Số lượng:{" "}
                      {food.quantity ?? 0}
                    </p>

                    <div className="card-actions">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => setSelectedFood(food)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleEdit(food)}
                      >
                        Sửa
                      </button>
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => handleDelete(food)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedFood && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedFood(null);
          }}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <div className="section-heading">
              <h2 id="detail-title">Chi tiết món ăn</h2>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setSelectedFood(null)}
              >
                Đóng
              </button>
            </div>

            <h3>{selectedFood.name}</h3>
            <p>
              <strong>Mã món:</strong> {selectedFood.foodId || "Chưa cập nhật"}
            </p>
            <p>
              <strong>Danh mục:</strong> {selectedFood.category || "Khác"}
            </p>
            <p>
              <strong>Ẩm thực:</strong>{" "}
              {selectedFood.cuisine || "Chưa cập nhật"}
            </p>
            <p>
              <strong>Nguyên liệu:</strong>{" "}
              {Array.isArray(selectedFood.ingredients) &&
              selectedFood.ingredients.length
                ? selectedFood.ingredients.join(", ")
                : "Chưa cập nhật"}
            </p>
            <p>
              <strong>Giá:</strong>{" "}
              {Number(selectedFood.price).toLocaleString("vi-VN")} ₫
            </p>
            <p>
              <strong>Số lượng:</strong> {selectedFood.quantity ?? 0}
            </p>
            <p>
              <strong>Mô tả:</strong>{" "}
              {selectedFood.description || "Chưa có mô tả"}
            </p>
            {(selectedFood.imageUrl || selectedFood.image) && (
              <img
                className="detail-image"
                src={selectedFood.imageUrl || selectedFood.image}
                alt={selectedFood.name}
              />
            )}
            <button
              className="primary-button"
              type="button"
              onClick={() => handleEdit(selectedFood)}
            >
              Sửa món ăn này
            </button>
          </section>
        </div>
      )}

      <footer>Ứng dụng quản lý món ăn · React + Node.js + MongoDB</footer>
    </main>
  );
}

export default App;
