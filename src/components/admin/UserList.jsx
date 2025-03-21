// src/components/admin/UserList.jsx
import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig"; // oldindan sozlangan axios instance
import { useSelector } from "react-redux";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Agar tokenni Redux'dan olayotgan bo'lsangiz:
  const token = useSelector((state) => state.auth.token);
  // Yoki, agar Redux ishlatmasangiz, localStorage dan:
  // const token = localStorage.getItem("access");

  // Foydalanuvchilarni API dan olish
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/accounts/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Agar DRF pagination ishlatilsa:
      if (response.data.results) {
        setUsers(response.data.results);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.warn(
          "Noto'g'ri formatdagi foydalanuvchilar ma'lumotlari:",
          response.data
        );
        setUsers([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Foydalanuvchilarni olishda xato:", err);
      setError("Foydalanuvchilarni olishda xato");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Edit tugmasi bosilganda
  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    });
  };

  // Inputlardagi o'zgarishlarni qayd etish
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Saqlash tugmasi bosilganda
  const handleSave = async () => {
    try {
      await axios.put(`/accounts/users/${editingUser}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUser(null);
      fetchUsers(); // yangilangan ro'yxatni qayta olish
    } catch (error) {
      console.error("Foydalanuvchini yangilashda xato:", error);
      setError("Foydalanuvchini yangilashda xato");
    }
  };

  // Edit rejimidan chiqish
  const handleCancel = () => {
    setEditingUser(null);
  };

  return (
    <div>
      <h1>Foydalanuvchilar ro'yxati</h1>
      {loading && <p>Yuklanmoqda...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Username</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Harakatlar</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                {editingUser === user.id ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                ) : (
                  user.username
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                ) : (
                  user.full_name
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <>
                    <button onClick={handleSave}>Saqlash</button>
                    <button onClick={handleCancel}>Bekor qilish</button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(user)}>Tahrirlash</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
