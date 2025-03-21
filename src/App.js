// App.js
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { setNavigate } from "./NavigationService";
import Login from "./components/Login";
import LayoutWrapper from "./components/LayoutWrapper";
import ProductTable from "./components/admin/ProductTable";
import AdminDashboard from "./components/admin/AdminDashboard";
import CourierTable from "./components/admin/CourierTable";
import CitiesTable from "./components/admin/CitiesTable";
import RegionsTable from "./components/admin/RegionsTable";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserList from "./components/admin/UserList";

// Create a wrapper component to use useNavigate
function AppWithNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="main" element={<LayoutWrapper />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductTable />} />
          <Route path="couriers" element={<CourierTable />} />
          <Route path="cities" element={<CitiesTable />} />
          <Route path="regions" element={<RegionsTable />} />
          <Route path="users" element={<UserList />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWithNavigation />
    </BrowserRouter>
  );
}

export default App;
