import React, { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import ReactPaginate from "react-paginate";
import "../../style/product-table.scss";
import { ReactDialogBox } from "react-js-dialog-box";
import "react-js-dialog-box/dist/index.css";
import UploadFileDialog from "./UploadFileDialog";
import { AdminContext } from "../commonContext";
import { FileUp, Filter, FilterX } from "lucide-react";
import moment from "moment";

// Updated defaultFilters to include a universal search field
const defaultFilters = {
  order_status: "",
  region: "",
  city: "",
  assigned: "",
  search: "", // new search field
};

export default function ProductTable() {
  const { pageName, setPageName } = React.useContext(AdminContext);
  setPageName("Pochtalar ro'yxati");
  // Product data & pagination states
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Cascade filter data
  const [regions, setRegions] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  // Couriers list
  const [couriers, setCouriers] = useState([]);

  // Filter states
  const [filterInput, setFilterInput] = useState({ ...defaultFilters });
  const [filters, setFilters] = useState({ ...defaultFilters });

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog for file upload
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // On mount, fetch regions, cities, and couriers
  useEffect(() => {
    fetchRegions();
    fetchCities();
    fetchCouriers();
  }, []);

  // Re-fetch products when filters, currentPage or pageSize changes
  useEffect(() => {
    fetchProducts(currentPage);
  }, [filters, currentPage, pageSize]);

  // -------------- FETCH FUNCTIONS --------------
  const fetchProducts = async (pageNumber) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      // Include page_size and the search filter in your params
      const params = {
        ...filters,
        page: pageNumber,
        page_size: pageSize,
      };
      const response = await axios.get("/accounts/products/", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data;
      setProducts(data.results || []);
      setTotalCount(data.count || 0);
      const pages = Math.ceil((data.count || 0) / pageSize);
      setPageCount(pages);
    } catch (err) {
      setError(err.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get("/accounts/regions/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.results || [];
      setRegions(data);
    } catch (err) {
      console.error("Error fetching regions:", err);
    }
  };

  const fetchCities = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get("/accounts/cities/?page_size=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.results)
        ? res.data.results
        : res.data;
      setAllCities(data);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const fetchCouriers = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get("/accounts/couriers/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.results)
        ? res.data.results
        : res.data;
      setCouriers(data);
    } catch (err) {
      console.error("Error fetching couriers:", err);
    }
  };

  // -------------- CASCADE FILTER LOGIC --------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterInput((prev) => ({ ...prev, [name]: value }));

    if (name === "region") {
      setFilterInput((prev) => ({ ...prev, city: "" }));
      if (value) {
        const regionId = parseInt(value, 10);
        const filtered = allCities.filter((c) => {
          if (typeof c.region === "number") return c.region === regionId;
          if (c.region && typeof c.region.id === "number")
            return c.region.id === regionId;
          return false;
        });
        setFilteredCities(filtered);
      } else {
        setFilteredCities([]);
      }
    }
  };

  // -------------- FILTER & PAGINATION --------------
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setFilters({ ...filterInput });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterInput({ ...defaultFilters });
    setFilters({ ...defaultFilters });
    setFilteredCities([]);
    setCurrentPage(1);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
  };

  // -------------- ASSIGN/EDIT ASSIGNING --------------
  const handleAssignCourier = async (productId, courierId) => {
    try {
      const token = localStorage.getItem("access");
      await axios.patch(
        `/accounts/products/${productId}/`,
        { assigned_to: courierId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts(currentPage);
    } catch (err) {
      alert(
        "Error assigning courier: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  // Helper for filtering eligible couriers
  const getEligibleCouriers = (product) => {
    if (!product.city) return [];
    const cityId =
      typeof product.city === "number" ? product.city : product.city.id;
    return couriers.filter((courier) => {
      if (!courier.covered_cities) return false;
      return courier.covered_cities.some((c) => {
        if (c && typeof c === "object" && c.id) {
          return c.id === cityId;
        }
        return c === cityId;
      });
    });
  };

  // Helper: Get assigned courier's id
  const getAssignedCourierId = (product) => {
    if (!product.assigned_to) return "";
    return typeof product.assigned_to === "number"
      ? product.assigned_to
      : product.assigned_to.id;
  };

  if (loading)
    return <div className="product-table">Pochtalar yuklanmoqda ...</div>;
  if (error) return <div className="product-table">Xatolik: {error}</div>;

  return (
    <div className="product-table">
      <div className="filter-bar">
        <form onSubmit={handleFilterSubmit}>
          <label>
            Status:
            <select
              name="order_status"
              value={filterInput.order_status}
              onChange={handleFilterChange}
            >
              <option value="">Barchasi</option>
              <option value="Pending">⏳ Kutilmoqda</option>
              <option value="Cancelled">✅ Bekor qilingan</option>
              <option value="Delivered">❌ Yetkazilgan</option>
            </select>
          </label>

          <label>
            Viloyat:
            <select
              name="region"
              value={filterInput.region}
              onChange={handleFilterChange}
            >
              <option value="">Viloyat tanlash</option>
              {regions?.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tuman / Shahar:
            <select
              name="city"
              value={filterInput.city}
              onChange={handleFilterChange}
              disabled={!filterInput.region}
            >
              <option value="">Tuman tanlash</option>
              {filteredCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Kuryerga biriktirilgan:
            <select
              name="assigned"
              value={filterInput.assigned}
              onChange={handleFilterChange}
            >
              <option value="">Barchasi</option>
              <option value="assigned">✅ Biriktirilgan</option>
              <option value="unassigned">❌ Biriktirilmagan</option>
            </select>
          </label>

          {/* Universal search field */}
          <label>
            Qidirish:
            <input
              type="search"
              name="search"
              placeholder="Qidirish"
              value={filterInput.search}
              onChange={handleFilterChange}
            />
          </label>

          <button type="submit">
            <Filter /> Filtrlash
          </button>
          <button type="button" onClick={handleClearFilters}>
            <FilterX /> Filtrni tozalash
          </button>
          <button type="button" onClick={() => setIsDialogOpen(true)}>
            <FileUp /> Fayldan yuklash
          </button>
        </form>
      </div>

      <table className="minimal-table">
        <thead>
          <tr>
            <th>T/R</th>
            <th>Vaqt</th>
            <th>Manzil</th>
            <th>Viloyat</th>
            <th>Tuman/Shahar</th>
            <th>Telefon</th>
            <th>Status</th>
            <th>Biriktirilgan kuryer</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const assignedCourierId = getAssignedCourierId(p);
            const eligibleCouriers = getEligibleCouriers(p);

            if (
              assignedCourierId &&
              !eligibleCouriers.some((c) => c.id === assignedCourierId)
            ) {
              const assignedCourier = couriers.find(
                (c) => c.id === assignedCourierId
              );
              if (assignedCourier) {
                eligibleCouriers.push(assignedCourier);
              }
            }

            return (
              <tr key={p.id}>
                <td>{p.order_number}</td>
                <td>{moment(p.date).format("DD.MM.YYYY")}</td>
                <td>{p.address}</td>
                <td>{p.region_name}</td>
                <td>{p.city_name}</td>
                <td>{p.phone_number}</td>
                <td>{p.order_status}</td>
                <td>
                  <select
                    value={assignedCourierId}
                    onChange={(e) => handleAssignCourier(p.id, e.target.value)}
                  >
                    <option value="">-- Kuryer --</option>
                    {eligibleCouriers.length > 0 ? (
                      eligibleCouriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.user && c.user.full_name
                            ? c.user.full_name
                            : `Courier ${c.id}`}
                        </option>
                      ))
                    ) : (
                      <option disabled>No eligible courier</option>
                    )}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ReactPaginate
        previousLabel={"← Oldingisi"}
        nextLabel={"Keyingisi →"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"active"}
        forcePage={currentPage - 1}
      />

      {isDialogOpen && (
        <ReactDialogBox
          headerBackgroundColor="var(--primary-color)"
          headerTextColor="white"
          headerHeight="65"
          closeButtonColor="white"
          bodyBackgroundColor="white"
          bodyTextColor="black"
          zIndex="10"
          headerText="Fayl yuklash"
          onClose={() => setIsDialogOpen(false)}
          closeBox={() => setIsDialogOpen(false)}
        >
          <UploadFileDialog onClose={() => setIsDialogOpen(false)} />
        </ReactDialogBox>
      )}
    </div>
  );
}
