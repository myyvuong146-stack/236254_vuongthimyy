import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/foods";

function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Món chính",
    image: "",
  });
  const [editingId, setEditingId] = useState(null);

  async function loadFoods() {
    try {
      setError("");
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Không tải được danh sách món ăn");
      setFoods(await response.json());
    } catch {
      setError("Không kết nối được backend. Hãy kiểm tra server cổng 5000.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
          }),
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Không lưu được món ăn");
      }

      setForm({
        name: "",
        description: "",
        price: "",
        category: "Món chính",
        image: "",
      });
      setEditingId(null);
      await loadFoods();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(food) {
    setEditingId(food._id);
    setForm({
      name: food.name || "",
      description: food.description || "",
      price: String(food.price ?? ""),
      category: food.category || "Khác",
      image: food.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa món ăn này?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Không xóa được món ăn");
      await loadFoods();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "Món chính",
      image: "",
    });
  }

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-icon">🍲</div>
        <p className="eyebrow">QUẢN LÝ NHÀ BẾP</p>
        <h1>Quản lý món ăn</h1>
        <p className="subtitle">
          Quản lý thực đơn của bạn đơn giản và tiện lợi
        </p>
      </header>

      <section className="content">
        <form className="food-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "✏️ Cập nhật món ăn" : "➕ Thêm món ăn mới"}</h2>

          <label>
            Tên món ăn *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ví dụ: Phở bò"
              required
            />
          </label>

          <div className="form-row">
            <label>
              Giá (VNĐ) *
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="50000"
                required
              />
            </label>

            <label>
              Danh mục
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Món chính</option>
                <option>Món phụ</option>
                <option>Đồ uống</option>
                <option>Tráng miệng</option>
                <option>Khác</option>
              </select>
            </label>
          </div>

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

          <label>
            Đường dẫn hình ảnh (không bắt buộc)
            <input
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              {editingId ? "Lưu thay đổi" : "Thêm món ăn"}
            </button>
            {editingId && (
              <button
                className="secondary-button"
                type="button"
                onClick={cancelEdit}
              >
                Hủy
              </button>
            )}
          </div>
        </form>

        <section className="food-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THỰC ĐƠN CỦA BẠN</p>
              <h2>Danh sách món ăn</h2>
            </div>
            <span className="count">{foods.length} món</span>
          </div>

          {error && <p className="error-message">{error}</p>}
          {loading ? (
            <p className="empty-state">Đang tải món ăn...</p>
          ) : foods.length === 0 ? (
            <p className="empty-state">
              Chưa có món ăn. Hãy thêm món đầu tiên!
            </p>
          ) : (
            <div className="food-grid">
              {foods.map((food) => (
                <article className="food-card" key={food._id}>
                  {food.image ? (
                    <img
                      className="food-image"
                      src={food.image}
                      alt={food.name}
                    />
                  ) : (
                    <div className="food-placeholder">🍜</div>
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
                    <div className="card-actions">
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
                        onClick={() => handleDelete(food._id)}
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
      </section>

      <footer>Ứng dụng quản lý món ăn · React + Node.js + MongoDB</footer>
    </main>
  );
}

export default App;
