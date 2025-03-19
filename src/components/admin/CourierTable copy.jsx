import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import axios from "../../axiosConfig";
import { ReactDialogBox } from "react-js-dialog-box";
import "react-js-dialog-box/dist/index.css";
import EditRegionCityContent from "./EditRegionCityContent";
import "../../style/courier_table.scss";

const defaultFilters = {
  region: "", // region ID
  city: "", // city ID
  assigned: "", // "assigned"/"unassigned"/""
};

export default function CourierTable() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterInput, setFilterInput] = useState({ ...defaultFilters });
  const [filters, setFilters] = useState({ ...defaultFilters });

  // Cascade filter data
  const [regions, setRegions] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  // Dialog for editing cities
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);

  const token = localStorage.getItem("access");

  // ------------------ Fetch & Initialization ------------------
  useEffect(() => {
    fetchCouriers(currentPage);
    fetchRegions();
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever filters or page changes, re-fetch
  useEffect(() => {
    fetchCouriers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive_deps
  }, [filters, currentPage]);

  // ------------------ FETCH FUNCTION ------------------
  const fetchCouriers = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/accounts/couriers/", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...filters,
          page,
          page_size: pageSize,
        },
      });
      if (response.data.results) {
        setCouriers(response.data.results);
        setTotalCount(response.data.count);
      } else if (Array.isArray(response.data)) {
        setCouriers(response.data);
        setTotalCount(response.data.length);
      } else {
        setCouriers([]);
      }
    } catch (err) {
      setError(err.message || "Error fetching couriers");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const res = await axios.get("/accounts/regions/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.results ? res.data.results : res.data;
      if (Array.isArray(data)) {
        setRegions(data);
      }
    } catch (err) {
      console.error("Error fetching regions:", err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get("/accounts/cities/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.results ? res.data.results : res.data;
      setAllCities(data);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  // ------------------ FILTERS & CASCADE ------------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterInput((prev) => ({ ...prev, [name]: value }));

    // Cascade logic for region -> city
    if (name === "region") {
      // reset city
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

  // ------------------ PAGINATION ------------------
  const handlePageClick = (data) => {
    const newPage = data.selected + 1;
    setCurrentPage(newPage);
  };

  // ------------------ EDIT CITIES DIALOG ------------------
  const handleOpenDialog = (courier) => {
    setSelectedCourier(courier);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCourier(null);
  };

  const handleSaveCities = async (courierId, cityIds) => {
    try {
      await axios.patch(
        `/accounts/couriers/${courierId}/`,
        { covered_cities: cityIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCouriers(currentPage);
      handleCloseDialog();
    } catch (err) {
      alert(
        "Error updating covered cities: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  // Helper for displaying covered cities
  const getCitiesDisplay = (courier) => {
    if (courier.covered_cities_names) return courier.covered_cities_names;
    if (courier.covered_cities && courier.covered_cities.length > 0) {
      return courier.covered_cities
        .map((city) => (typeof city === "object" ? city.name : city))
        .join(", ");
    }
    return "(none)";
  };

  // ------------------ RENDER ------------------
  if (loading) return <div className="couriers-table">Loading couriers...</div>;
  if (error) return <div className="couriers-table">Error: {error}</div>;

  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <div className="couriers-table">
      <h2>Kuryerlar</h2>
      {/* FILTER BAR */}
      <div className="filter-bar">
        <form onSubmit={handleFilterSubmit}>
          <label>
            Region:
            <select
              name="region"
              value={filterInput.region}
              onChange={handleFilterChange}
            >
              <option value="">-- Select Region --</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            City:
            <select
              name="city"
              value={filterInput.city}
              onChange={handleFilterChange}
              disabled={!filterInput.region}
            >
              <option value="">-- Select City --</option>
              {filteredCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Assigned:
            <select
              name="assigned"
              value={filterInput.assigned}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </label>

          <button type="submit">Apply Filters</button>
          <button type="button" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </form>
      </div>

      {/* TABLE */}
      <table className="minimal-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>F.I.Sh.</th>
            <th>Covered Cities</th>
            <th>Username</th>
            <th>Plain Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {couriers.map((c) => {
            const fullName =
              c.user && c.user.full_name ? c.user.full_name : "(No name)";
            const userName =
              c.user && c.user.username ? c.user.username : "(No username)";
            return (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{fullName}</td>
                <td>{getCitiesDisplay(c)}</td>
                <td>{userName}</td>
                <td>{c.plain_password || "(none)"}</td>
                <td>
                  {/* EDIT CITIES BUTTON */}
                  <button onClick={() => handleOpenDialog(c)}>
                    Edit Cities
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* PAGINATION */}
      {pageCount > 1 && (
        <ReactPaginate
          previousLabel={"← Previous"}
          nextLabel={"Next →"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
          forcePage={currentPage - 1}
        />
      )}

      {/* REACT DIALOG BOX */}
      {isDialogOpen && selectedCourier && (
        <ReactDialogBox
          closeBox={handleCloseDialog}
          modalWidth="60%"
          headerBackgroundColor="var(--primary-color)"
          headerTextColor="white"
          headerHeight="65"
          closeButtonColor="white"
          bodyBackgroundColor="white"
          bodyTextColor="black"
          headerText={`Edit Covered Cities for ${
            selectedCourier.user?.full_name || "Courier"
          }`}
        >
          <EditRegionCityContent
            courier={selectedCourier}
            regions={regions}
            allCities={allCities}
            onSave={handleSaveCities}
            onClose={handleCloseDialog}
          />
        </ReactDialogBox>
      )}
    </div>
  );
}
