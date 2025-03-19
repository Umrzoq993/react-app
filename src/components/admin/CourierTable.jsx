import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../../style/courier_table.scss";
import { LandPlot } from "lucide-react";
import { ReactDialogBox } from "react-js-dialog-box";
import "react-js-dialog-box/dist/index.css";
import axios from "../../axiosConfig";
import { toast } from "react-toastify";
import EditRegionCityContent from "./EditRegionCityContent";
import ReactPaginate from "react-paginate";
import { AdminContext } from "../commonContext";
import { Plus, Filter, FilterX } from "lucide-react";

const token = localStorage.getItem("access");

// Updated defaultFilters including the new "assigned" field.
const defaultFilters = {
  region: "",
  city: "",
  assigned: "",
};

export default function CourierTable() {
  const { pageName, setPageName } = React.useContext(AdminContext);
  setPageName("Kuryerlar ro'yxati");
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // constant page size
  const [totalCount, setTotalCount] = useState(0);

  // Dialog for editing covered cities
  const [openCity, setOpenCity] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);

  // Filters
  const [filterInput, setFilterInput] = useState({ ...defaultFilters });
  const [filters, setFilters] = useState({ ...defaultFilters });

  // Cascade filter data
  const [regions, setRegions] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  // NEW: State for creating a Courier
  const [openCreate, setOpenCreate] = useState(false);

  // Functions to open/close creation dialog
  const handleOpenCreateDialog = () => setOpenCreate(true);
  const handleCloseCreateDialog = () => setOpenCreate(false);

  // After successfully creating a courier, refresh the table
  const handleNewCourierCreated = () => {
    fetchCouriers(currentPage);
    setOpenCreate(false);
  };

  // Fetch data once component mounts
  useEffect(() => {
    fetchCouriers(currentPage);
    fetchRegions();
    fetchCities();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchCouriers(currentPage);
    // eslint-disable-next-line
  }, [currentPage, filters]);

  const fetchCouriers = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios({
        url: "/accounts/couriers/",
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page,
          page_size: pageSize,
          region: filters.region,
          city: filters.city,
          assigned: filters.assigned,
        },
      });
      setCouriers(response.data.results);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      toast.error(err.message || "Error fetching data");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await axios({ url: "/accounts/regions/" });
      setRegions(response.data?.results);
    } catch (err) {
      toast.error("Error fetching regions: " + err.message);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios({ url: "/accounts/cities/" });
      setAllCities(response.data.results);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  // ------------------ FILTERS ------------------
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
    setCurrentPage(data.selected + 1);
  };

  // ------------------ EDIT CITIES DIALOG ------------------
  const handleCloseCourierDialog = () => {
    setOpenCity(false);
    setSelectedCourier(null);
  };

  const handleOpenCourierDialog = (courier) => {
    setOpenCity(true);
    setSelectedCourier(courier);
  };

  const handleSaveCities = async (courierId, cityIds) => {
    try {
      await axios.patch(
        `/accounts/couriers/${courierId}/`,
        { covered_cities: cityIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCouriers(currentPage);
      handleCloseCourierDialog();
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

  if (loading) return <div className="couriers-table">Loading couriers...</div>;
  if (error)
    return <div className="couriers-table">Error: {String(error)}</div>;

  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <div className="couriers-table">
      {/* FILTER BAR */}
      <div className="filter-bar">
        <form onSubmit={handleFilterSubmit}>
          <label>
            <span>Viloyat (shahar)</span>
            <select
              value={filterInput?.region}
              onChange={handleFilterChange}
              name="region"
            >
              <option value="">Viloyat (shahar)</option>
              {regions?.map((item, index) => (
                <option key={index} value={item?.id}>
                  {item?.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Shahar (tuman)</span>
            <select
              value={filterInput?.city}
              onChange={handleFilterChange}
              name="city"
              disabled={!filterInput?.region}
            >
              <option value="">Shahar (tuman)</option>
              {filteredCities?.map((c) => (
                <option key={c?.id} value={c?.id}>
                  {c?.name}
                </option>
              ))}
            </select>
          </label>
          {/* New Assigned Filter */}
          <label>
            <span>Kuryer holati</span>
            <select
              value={filterInput?.assigned}
              onChange={handleFilterChange}
              name="assigned"
            >
              <option value="">Barchasi</option>
              <option value="assigned">✅ Biriktirilgan</option>
              <option value="unassigned">✖️ Biriktirilmagan</option>
            </select>
          </label>
          <button type="submit">
            <Filter /> Apply Filters
          </button>
          <button type="button" onClick={handleClearFilters}>
            <FilterX /> Filtrni tozalash
          </button>
          {/* Button to open 'Create Courier' dialog */}
          <button type="button" onClick={handleOpenCreateDialog}>
            <Plus /> Add Courier
          </button>
        </form>
      </div>

      {/* TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>T/R</th>
            <th>F.I.Sh.</th>
            <th>Javobgarlik hududlari</th>
            <th>Foydalanuvchi nomi</th>
            <th>Foydalanuvchi paroli</th>
            <th>Qo'shimchalar</th>
          </tr>
        </thead>
        <tbody>
          {couriers?.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item?.user?.full_name || "No Full Name"}</td>
              <td>{item?.covered_cities_names || getCitiesDisplay(item)}</td>
              <td>{item?.user?.username || "No username"}</td>
              <td>{item?.plain_password || ""}</td>
              <td className="actions">
                <LandPlot onClick={() => handleOpenCourierDialog(item)} />
              </td>
            </tr>
          ))}
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

      {/* EDIT COVERED CITIES DIALOG */}
      {openCity && selectedCourier && (
        <ReactDialogBox
          closeBox={handleCloseCourierDialog}
          modalWidth="60%"
          headerBackgroundColor="var(--primary-color)"
          headerTextColor="white"
          headerHeight="65"
          closeButtonColor="white"
          bodyBackgroundColor="white"
          bodyTextColor="black"
          zIndex="10"
          headerText={`Edit Covered Cities for ${
            selectedCourier.user?.full_name || "Courier"
          }`}
        >
          <EditRegionCityContent
            courier={selectedCourier}
            regions={regions}
            allCities={allCities}
            onSave={handleSaveCities}
            onClose={handleCloseCourierDialog}
          />
        </ReactDialogBox>
      )}

      {/* CREATE NEW COURIER DIALOG */}
      {openCreate && (
        <CreateCourierDialog
          onClose={handleCloseCreateDialog}
          onCreated={handleNewCourierCreated}
          regions={regions}
          allCities={allCities}
        />
      )}
    </div>
  );
}

/* 
  Inline 'CreateCourierDialog' component with enhanced design.
  It uses ReactDialogBox with styled-components for a modern look.
*/
function CreateCourierDialog({ onClose, onCreated, regions, allCities }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [coveredCities, setCoveredCities] = useState([]);

  // Filter the allCities list based on chosen region
  const filteredCities = React.useMemo(() => {
    if (!region) return [];
    return allCities.filter((c) => {
      if (typeof c.region === "number") {
        return c.region === parseInt(region, 10);
      } else if (c.region && typeof c.region.id === "number") {
        return c.region.id === parseInt(region, 10);
      }
      return false;
    });
  }, [region, allCities]);

  const handleCityToggle = (cityId) => {
    setCoveredCities((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  const handleSubmit = async () => {
    if (!username || !fullName || !region || coveredCities.length === 0) {
      toast.error("Please fill in all fields, including at least one city.");
      return;
    }

    try {
      await axios.post("/accounts/couriers/create/", {
        username,
        full_name: fullName,
        region: parseInt(region, 10),
        covered_cities: coveredCities.map((id) => parseInt(id, 10)),
      });
      toast.success("Courier created successfully!");
      onCreated(); // Refresh list in parent
    } catch (err) {
      console.error(err);
      toast.error(
        "Error creating courier: " + (err.response?.data || err.message)
      );
    }
  };

  return (
    <ReactDialogBox
      closeBox={onClose}
      modalWidth="40%"
      headerText="Create New Courier"
      headerBackgroundColor="#f59023"
      headerTextColor="white"
      headerHeight="65"
      closeButtonColor="white"
      bodyBackgroundColor="white"
      bodyTextColor="black"
      zIndex="999"
    >
      <DialogContent>
        <FormField>
          <Label>Username:</Label>
          <Input
            type="text"
            placeholder="Enter courier's username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormField>
        <FormField>
          <Label>Full Name:</Label>
          <Input
            type="text"
            placeholder="Enter courier's full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </FormField>
        <FormField>
          <Label>Region:</Label>
          <Select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">-- Select Region --</option>
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField>
          <Label style={{ marginBottom: "0.5rem" }}>
            Covered Cities: (Check all that apply)
          </Label>
          <CheckboxList>
            {filteredCities.map((city) => (
              <CheckboxItem key={city.id}>
                <input
                  type="checkbox"
                  checked={coveredCities.includes(city.id)}
                  onChange={() => handleCityToggle(city.id)}
                />
                {city.name}
              </CheckboxItem>
            ))}
          </CheckboxList>
        </FormField>
        <ActionsRow>
          <ButtonPrimary onClick={handleSubmit}>Create</ButtonPrimary>
          <ButtonSecondary onClick={onClose}>Cancel</ButtonSecondary>
        </ActionsRow>
      </DialogContent>
    </ReactDialogBox>
  );
}

/* ------------------ STYLED COMPONENTS ------------------ */

const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  &:focus {
    outline: none;
    border-color: #f59023;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  &:focus {
    outline: none;
    border-color: #f59023;
  }
`;

const CheckboxList = styled.div`
  border: 1px solid #ccc;
  border-radius: 6px;
  max-height: 120px;
  overflow-y: auto;
  padding: 0.5rem;
`;

const CheckboxItem = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  cursor: pointer;
  input {
    margin-right: 0.5rem;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const ButtonPrimary = styled.button`
  background-color: #f59023;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  &:hover {
    background-color: #e07c1e;
  }
`;

const ButtonSecondary = styled.button`
  background-color: #f59023;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  &:hover {
    background-color: #888;
  }
`;
