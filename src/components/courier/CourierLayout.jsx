import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import ReactPaginate from "react-paginate";
import "../../style/courierlayout.scss";
import { LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourierLayout() {
  const [products, setProducts] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Fetch assigned products on mount
  useEffect(() => {
    fetchAssignedProducts(1); // Start from page 1
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("/accounts/me/");
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch assigned products from the server
  const fetchAssignedProducts = async (currentPage) => {
    try {
      const token = localStorage.getItem("access"); // stored token
      const response = await axios.get(
        `/accounts/courier/products/?page=${currentPage}`
      );
      // Assume DRF returns a paginated response { count, results: [...] }
      if (response.data && Array.isArray(response.data.results)) {
        setProducts(response.data.results);
        setPageCount(Math.ceil(response.data.count / 10)); // pageCount = total items / 10
      } else {
        throw new Error(
          "Unexpected response format. Expected an array in 'results'."
        );
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || "An error occurred while fetching products.");
      setLoading(false);
    }
  };

  // Called by react-paginate
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    fetchAssignedProducts(selectedPage);
  };

  // Confirm receipt by sending a POST request to /confirm-receipt/
  const handleConfirmReceipt = async (productId) => {
    try {
      const token = localStorage.getItem("access");
      await axios.post(
        "http://localhost:8000/api/accounts/confirm-receipt/",
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the product list after confirming receipt
      fetchAssignedProducts(1);
    } catch (err) {
      alert(err.response?.data?.detail || "Error confirming receipt.");
    }
  };

  // Confirm delivery by sending a POST request to /confirm-delivered/
  const handleConfirmDelivery = async (productId) => {
    try {
      const token = localStorage.getItem("access");
      await axios.post(
        "http://localhost:8000/api/accounts/confirm-delivered/",
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the product list after confirming delivery
      fetchAssignedProducts(1);
    } catch (err) {
      alert(err.response?.data?.detail || "Error confirming delivery.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  return (
    <div className="courier-layout">
      <div className="navbar">
        <div className="left">
          <span>Kuryer mahsulotlari</span>
        </div>
        <div className="right">
          <LogOutIcon onClick={handleLogout} size={24} />
        </div>
      </div>
      <h3>Assigned Products</h3>
      <table className="minimal-table">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Date</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th> {/* new column for buttons */}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.order_number}</td>
              <td>{new Date(product.date).toLocaleDateString()}</td>
              <td>{product.address}</td>
              <td>{product.order_status}</td>
              <td>
                {/* Show Confirm Receipt button if status is "Pending" or "Dispatched" */}
                {(product.order_status === "Pending" ||
                  product.order_status === "Dispatched") && (
                  <button
                    className="action-btn"
                    onClick={() => handleConfirmReceipt(product.id)}
                  >
                    Confirm Receipt
                  </button>
                )}
                {/* Show Confirm Delivery button if status is "Received" */}
                {product.order_status === "Received" && (
                  <button
                    className="action-btn"
                    onClick={() => handleConfirmDelivery(product.id)}
                  >
                    Confirm Delivery
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={"← Previous"}
        nextLabel={"Next →"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
    </div>
  );
}
