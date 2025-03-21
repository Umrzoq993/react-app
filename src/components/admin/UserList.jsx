import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig"; // pre-configured axios instance
import { useSelector } from "react-redux";
import "../../style/users-table.scss";
import UsersDialog from "./UsersDialog";
import { AdminContext } from "../commonContext";
import { Pencil, Plus, Trash2 } from "lucide-react";

function UserList() {
  const { pageName, setPageName } = React.useContext(AdminContext);
  setPageName("Foydalanuvchilar ro'yxati");
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  // For editing an existing user
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    role: "Admin", // default value
    password: "",
    confirmPassword: "",
  });
  // For creating a new user
  const [createFormData, setCreateFormData] = useState({
    username: "",
    full_name: "",
    role: "Admin", // default value
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // For password policy error messages
  const [passwordError, setPasswordError] = useState("");

  // Dialog states for update, create and delete
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  // Get token from Redux store
  const token = useSelector((state) => state.auth.token);

  // Fetch users from API and filter out users with role "courier"
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/accounts/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let fetchedUsers = [];
      if (response.data.results) {
        fetchedUsers = response.data.results;
      } else if (Array.isArray(response.data)) {
        fetchedUsers = response.data;
      } else {
        console.warn("Unexpected user data format:", response.data);
      }
      // Filter out users with role "courier" (case-insensitive)
      const filteredUsers = fetchedUsers.filter(
        (user) => user.role && user.role.toLowerCase() !== "courier"
      );
      setUsers(filteredUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error fetching users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- EDIT LOGIC ---
  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
    setPasswordError("");
  };

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- CREATE LOGIC ---
  const openCreateDialog = () => {
    setCreateFormData({
      username: "",
      full_name: "",
      role: "Admin", // default role
      password: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setPasswordError("");
  };

  const handleCreateChange = (e) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
  };

  // Minimal password validation:
  // - At least 8 characters
  // - Contains at least one letter and one digit
  const validatePassword = (password) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    return password.length >= minLength && hasLetter && hasDigit;
  };

  const handleEditConfirm = async () => {
    // If password fields are not empty, validate them.
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }
      if (!validatePassword(formData.password)) {
        setPasswordError(
          "Parol kamida 8 ta belgidan iborat bo'lishi kerak va unda kamida bir harf va bir raqam bo'lishi kerak."
        );
        return;
      }
    }

    // Prepare data: if password is empty, do not include it.
    const updateData = {
      username: formData.username,
      full_name: formData.full_name,
      role: formData.role,
    };
    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      await axios.put(`/accounts/users/${editingUser.id}/`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeEditDialog();
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Error updating user");
    }
  };

  // Use the /register/ endpoint to properly create a user with a password.
  const handleCreateConfirm = async () => {
    if (createFormData.password !== createFormData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (!validatePassword(createFormData.password)) {
      setPasswordError(
        "Parol kamida 8 ta belgidan iborat bo'lishi kerak va unda kamida bir harf va bir raqam bo'lishi kerak."
      );
      return;
    }

    const newUserData = {
      username: createFormData.username,
      full_name: createFormData.full_name,
      role: createFormData.role,
      password: createFormData.password,
    };

    try {
      await axios.post("/accounts/register/", newUserData, {
        // If you don't need authentication for registration, you can omit the header:
        // headers: { Authorization: `Bearer ${token}` },
      });
      closeCreateDialog();
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Error creating user");
    }
  };

  // --- DELETE LOGIC ---
  const openDeleteDialog = (user) => {
    setDeleteUser(user);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteUser(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/accounts/users/${deleteUser.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeDeleteDialog();
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error deleting user");
    }
  };

  if (loading) return <div className="table-container">Yuklanmoqda...</div>;
  if (error) return <div className="table-container">Xatolik: {error}</div>;

  return (
    <div className="table-container">
      <div className="top-content">
        <button className="add" onClick={openCreateDialog}>
          <Plus /> Yangi foydalanuvchi
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Foydalanuvchi nomi</th>
            <th>Familiya, ismi, sharifi</th>
            <th>Foydalanuvchi roli</th>
            <th>Qo'shimchalar</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.full_name}</td>
              <td>{user.role}</td>
              <td className="actions">
                <Pencil size={20} onClick={() => openEditDialog(user)} />
                <Trash2 size={20} onClick={() => openDeleteDialog(user)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <UsersDialog
          isOpen={isEditDialogOpen}
          title="Foydalanuvchi ma'lumotlarini o'zgartirish"
          onClose={closeEditDialog}
          onConfirm={handleEditConfirm}
        >
          <div className="dialog-form">
            <label>
              <span>Foydalanuvchi nomi:</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleEditChange}
              />
            </label>
            <label>
              <span>Familiya, ismi, sharifi:</span>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleEditChange}
              />
            </label>
            <label>
              <span>Foydalanuvchi roli:</span>
              <select
                name="role"
                value={formData.role}
                onChange={handleEditChange}
              >
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
              </select>
            </label>
            <label>
              <span>Yangi parol:</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleEditChange}
                placeholder="Parolni o'zgartirmoqchi bo'lsangiz to'ldiring"
              />
            </label>
            <label>
              <span>Parolni tasdiqlash:</span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleEditChange}
                placeholder="Parolni o'zgartirmoqchi bo'lsangiz to'ldiring"
              />
            </label>
            {passwordError && (
              <p style={{ color: "red", fontSize: "0.85rem" }}>
                {passwordError}
              </p>
            )}
          </div>
        </UsersDialog>
      )}

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <UsersDialog
          isOpen={isCreateDialogOpen}
          title="Yangi foydalanuvchi yaratish"
          onClose={closeCreateDialog}
          onConfirm={handleCreateConfirm}
        >
          <div className="dialog-form">
            <label>
              <span>Foydalanuvchi nomi:</span>
              <input
                type="text"
                name="username"
                value={createFormData.username}
                onChange={handleCreateChange}
              />
            </label>
            <label>
              <span>Familiya, ismi, sharifi:</span>
              <input
                type="text"
                name="full_name"
                value={createFormData.full_name}
                onChange={handleCreateChange}
              />
            </label>
            <label>
              <span>Foydalanuvchi roli:</span>
              <select
                name="role"
                value={createFormData.role}
                onChange={handleCreateChange}
              >
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
              </select>
            </label>
            <label>
              <span>Foydalanuvchi paroli:</span>
              <input
                type="password"
                name="password"
                value={createFormData.password}
                onChange={handleCreateChange}
              />
            </label>
            <label>
              <span>Parolni tasdiqlash:</span>
              <input
                type="password"
                name="confirmPassword"
                value={createFormData.confirmPassword}
                onChange={handleCreateChange}
              />
            </label>
            {passwordError && (
              <p style={{ color: "red", fontSize: "0.85rem" }}>
                {passwordError}
              </p>
            )}
          </div>
        </UsersDialog>
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <UsersDialog
          isOpen={isDeleteDialogOpen}
          title="Foydalanuvchini o'chirish"
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteConfirm}
        >
          <p>
            Siz <strong>{deleteUser.username}</strong> foydalanuvchini
            o'chirishni istaysizmi?
          </p>
        </UsersDialog>
      )}
    </div>
  );
}

export default UserList;
