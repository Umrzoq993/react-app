// src/components/admin/UserList.jsx
import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig"; // pre-configured axios instance
import { useSelector } from "react-redux";
import "../../style/users-table.scss";
import UsersDialog from "./UsersDialog"; // Custom dialog component

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states for update and delete
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get token from Redux store (or use localStorage if not using Redux)
  const token = useSelector((state) => state.auth.token);
  // const token = localStorage.getItem("access");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- EDIT LOGIC ---
  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditConfirm = async () => {
    try {
      await axios.put(`/accounts/users/${editingUser.id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeEditDialog();
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Error updating user");
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

  if (loading) return <div className="table-container">Loading...</div>;
  if (error) return <div className="table-container">Error: {error}</div>;

  return (
    <div className="table-container">
      <h1>User List</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.full_name}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => openEditDialog(user)}>Edit</button>
                <button onClick={() => openDeleteDialog(user)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <UsersDialog
          isOpen={isEditDialogOpen}
          title="Edit User"
          onClose={closeEditDialog}
          onConfirm={handleEditConfirm}
        >
          <div className="dialog-form">
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Full Name:
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Role:
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleEditChange}
              />
            </label>
          </div>
        </UsersDialog>
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <UsersDialog
          isOpen={isDeleteDialogOpen}
          title="Delete User"
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteConfirm}
        >
          <p>
            Are you sure you want to delete user{" "}
            <strong>{deleteUser.username}</strong>?
          </p>
        </UsersDialog>
      )}
    </div>
  );
}

export default UserList;
