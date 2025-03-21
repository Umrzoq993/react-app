import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import "../../style/courier_table.scss";
import { LandPlot, Pencil, Plus, Filter, FilterX } from "lucide-react";
import { ReactDialogBox } from "react-js-dialog-box";
import "react-js-dialog-box/dist/index.css";
import axios from "../../axiosConfig";
import { toast } from "react-toastify";
import EditRegionCityContent from "./EditRegionCityContent";
import ReactPaginate from "react-paginate";
import { AdminContext } from "../commonContext";
import NewCourierDialog from "./NewCourierDialog"; // your create courier dialog

const token = localStorage.getItem("access");

// Updated defaultFilters including the new "assigned" field.
const defaultFilters = {
  region: "",
  city: "",
  assigned: "",
  search: "",
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

  // NEW: State for editing courier details (username, full name)
  const [isEditCourierDialogOpen, setIsEditCourierDialogOpen] = useState(false);
  const [editingCourierData, setEditingCourierData] = useState(null);

  // NEW: State for creating a Courier
  const [openCreate, setOpenCreate] = useState(false);

  // Filters
  const [filterInput, setFilterInput] = useState({ ...defaultFilters });
  const [filters, setFilters] = useState({ ...defaultFilters });

  // Cascade filter data
  const [regions, setRegions] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

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
          search: filters.search, // added search param
        },
      });
      setCouriers(response.data.results);
      setTotalCount(response.data.count || 0);
    } catch (err) {
      toast.error(err.message || "Ma'lumotlar yuklanmadi");
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
      const response = await axios({ url: "/accounts/cities/?page_size=1000" });
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

  // ------------------ EDIT COVERED CITIES DIALOG ------------------
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

  // ------------------ EDIT COURIER DETAILS ------------------
  const openEditCourierDialog = (courier) => {
    setEditingCourierData({
      id: courier.user.id, // User id for /accounts/users/
      courier_id: courier.id, // Courier id for /accounts/couriers/
      username: courier.user.username,
      full_name: courier.user.full_name,
      // Initialize password fields as empty
      password: "",
      confirmPassword: "",
    });
    setIsEditCourierDialogOpen(true);
  };

  const closeEditCourierDialog = () => {
    setIsEditCourierDialogOpen(false);
    setEditingCourierData(null);
  };

  const handleEditCourierChange = (e) => {
    const { name, value } = e.target;
    setEditingCourierData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return password.length >= minLength && hasLetter && hasDigit;
  };

  const handleEditCourierConfirm = async () => {
    // If either password field is non-empty, ensure they match.
    if (editingCourierData.password || editingCourierData.confirmPassword) {
      if (editingCourierData.password !== editingCourierData.confirmPassword) {
        toast.error(
          "Parollar mos kelmadi. Iltimos tekshirib qaytadan kiriting."
        );
        return;
      }
      if (!validatePassword(editingCourierData.password)) {
        toast.error(
          "Parol kamida 8 ta belgidan iborat bo'lishi kerak va unda kamida bir harf ham, bir raqam ham bo'lishi shart."
        );
        return;
      }
    }

    try {
      // Prepare the payload for updating the user.
      const userPayload = {
        username: editingCourierData.username,
        full_name: editingCourierData.full_name,
        // Optionally, include role if needed:
        // role: editingCourierData.role,
        ...(editingCourierData.password
          ? { password: editingCourierData.password }
          : {}),
      };

      // Update the User model.
      await axios.patch(
        `/accounts/users/${editingCourierData.id}/`,
        userPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If a new password was provided, update the Courier's plain_password field.
      if (editingCourierData.password) {
        await axios.patch(
          `/accounts/couriers/${editingCourierData.courier_id}/`,
          { plain_password: editingCourierData.password },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      closeEditCourierDialog();
      fetchCouriers(currentPage);
      toast.success("Kuryer ma'lumotlari muvaffaqiyatli o'zgartirildi.");
    } catch (err) {
      console.error("Kuryer ma'lumotlarini tahrirlashda xatolik: ", err);
      toast.error(
        "Kuryer ma'lumotlarini tahrirlashda xatolik: " +
          (err.response?.data || err.message)
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

  if (loading)
    return (
      <div className="couriers-table">
        Kuryer haqidagi ma'lumotlar yuklanmoqda...
      </div>
    );
  if (error)
    return (
      <div className="couriers-table">Xatolik yuz berdi: {String(error)}</div>
    );

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
          <label>
            <span>Qidirish:</span>
            <input
              type="search"
              name="search"
              placeholder="F.I.Sh. yoki username"
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
                {/* Edit courier details */}
                <Pencil size={20} onClick={() => openEditCourierDialog(item)} />
                {/* Edit covered cities */}
                <LandPlot
                  size={20}
                  onClick={() => handleOpenCourierDialog(item)}
                />
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
          headerText={`${
            selectedCourier.user?.full_name || "Kuryer"
          } ning javobgar tumanlari`}
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
        <NewCourierDialog
          onClose={handleCloseCreateDialog}
          onCreated={handleNewCourierCreated}
          regions={regions}
          cities={allCities}
        />
      )}

      {/* EDIT COURIER DIALOG */}
      {isEditCourierDialogOpen && editingCourierData && (
        <EditCourierDialog
          courier={editingCourierData}
          onClose={closeEditCourierDialog}
          onConfirm={handleEditCourierConfirm}
          onChange={handleEditCourierChange}
        />
      )}
    </div>
  );
}

/* ------------------ EDIT COURIER DIALOG COMPONENT ------------------ */
function EditCourierDialog({ courier, onClose, onConfirm, onChange }) {
  return (
    <ReactDialogBox
      headerText="Kuryer ma'lumotlarini tahrirlash"
      headerBackgroundColor="#f59023"
      headerTextColor="white"
      closeButtonColor="white"
      bodyBackgroundColor="white"
      bodyTextColor="#333"
      headerHeight="70"
      closeBox={onClose}
      modalWidth="40%"
    >
      <DialogContainer>
        <FormField>
          <Label>Foydalanuvchi nomi:</Label>
          <Input
            type="text"
            name="username"
            value={courier.username}
            onChange={onChange}
          />
        </FormField>
        <FormField>
          <Label>Familiya, ismi, sharifi:</Label>
          <Input
            type="text"
            name="full_name"
            value={courier.full_name}
            onChange={onChange}
          />
        </FormField>
        <FormField>
          <Label>Yangi parol:</Label>
          <Input
            type="password"
            name="password"
            value={courier.password}
            onChange={onChange}
            placeholder="Parol o'zgarmasa bo'sh qoldiring"
          />
        </FormField>
        <FormField>
          <Label>Parolni takrorlang:</Label>
          <Input
            type="password"
            name="confirmPassword"
            value={courier.confirmPassword}
            onChange={onChange}
            placeholder="Parol o'zgarmasa bo'sh qoldiring"
          />
        </FormField>
        <ActionsRow>
          <ButtonPrimary onClick={onConfirm}>Saqlash</ButtonPrimary>
          <ButtonSecondary onClick={onClose}>Bekor qilish</ButtonSecondary>
        </ActionsRow>
      </DialogContainer>
    </ReactDialogBox>
  );
}

/* Styled components for dialog */
const DialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  &:focus {
    outline: none;
    border-color: #f59023;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
  background-color: #ccc;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  &:hover {
    background-color: #bbb;
  }
`;
