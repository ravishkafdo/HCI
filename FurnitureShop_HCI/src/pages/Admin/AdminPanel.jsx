import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./AdminPanel.css";

const socket = io("http://localhost:5001", { withCredentials: true });

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("join-admin");

    socket.on("product-updated", (data) => {
      showToast(data.message || "Product catalog updated", "success");
      fetchProducts();
    });

    return () => {
      socket.off("product-updated");
    };
  }, []);

  const categories = [
    "All",
    "Living Room",
    "Bedroom",
    "Dining Room",
    "Office",
    "Storage",
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (selectedCategory !== "All")
        params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", currentPage);
      params.append("limit", 10);

      const response = await fetch(
        `http://localhost:5001/api/products?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      setProducts(data.products);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete product");

      socket.emit("product-update", {
        action: "delete",
        message: "Product deleted successfully",
      });

      showToast("Product deleted successfully", "success");
      fetchProducts();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button className="admin-action-btn" onClick={() => navigate("/")}>
            <i className="material-icons">home</i>
            View Store
          </button>
          <button
            className="admin-action-btn"
            onClick={() => navigate("/admin/products/new")}
          >
            <i className="material-icons">add</i>
            Add Product
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`admin-tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {activeTab === "products" && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <div className="category-filter">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">
                <i className="material-icons">search</i>
              </button>
            </form>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <img
                            src={`http://localhost:5001${product.thumbnail}`}
                            alt={product.title}
                            className="product-thumbnail"
                          />
                        </td>
                        <td>{product.title}</td>
                        <td>{product.category}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>
                          <div className="rating-stars">
                            {product.rating} <span className="star">★</span>
                          </div>
                        </td>
                        <td>
                          <div className="product-actions">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                navigate(`/admin/products/edit/${product._id}`)
                              }
                            >
                              <i className="material-icons">edit</i>
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              <i className="material-icons">delete</i>
                            </button>
                            <button
                              className="view-btn"
                              onClick={() =>
                                navigate(`/product/${product._id}`)
                              }
                            >
                              <i className="material-icons">visibility</i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    <i className="material-icons">navigate_before</i>
                  </button>

                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    <i className="material-icons">navigate_next</i>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="admin-content">
          <h2>Orders Management</h2>
          <p>Orders management features coming soon.</p>
        </div>
      )}

      {activeTab === "users" && (
        <div className="admin-content">
          <h2>User Management</h2>
          <p>User management features coming soon.</p>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="admin-content">
          <h2>Analytics</h2>
          <p>Analytics features coming soon.</p>
        </div>
      )}

      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
