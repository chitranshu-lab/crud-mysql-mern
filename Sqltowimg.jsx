  import React, { useState, useEffect, useRef } from "react";
  import axios from "axios";

  const API = "http://localhost:4000";

  const Sqltowimage = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);  
    const editSectionRef = useRef(null);


    const fetchUsers = async () => {
      const res = await axios.get(`${API}/users`);
      setUsers(res.data);
    };

    useEffect(() => {
      fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      if (image) formData.append("image", image);

      if (editingId) {
        // Update
        await axios.put(`${API}/users/${editingId}`, formData);
      } else {
        // Create
        if (!image) return alert("Please upload an image.");
        await axios.post(`${API}/users`, formData);
      }

      setForm({ name: "", email: "", password: "" });
      setImage(null);
      setEditingId(null);
      fetchUsers();
    };

    const handleDelete = async (id) => {
      await axios.delete(`${API}/users/${id}`);
      fetchUsers();
    };

    const handleEdit = (user) => {
      setForm({ name: user.name, email: user.email, password: "" }); // Don’t prefill password
      setImage(null); // Optional: don't show existing image for simplicity
      setEditingId(user.id);
       editSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

   // const handleEditClick = () => {
   //   // Scroll to the edit section smoothly
   //   editSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

    return (
      <div>
        <h2 ref={editSectionRef}>{editingId ? "Update User" : "Create User"}</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button type="submit">{editingId ? "Update" : "Create"}</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", email: "", password: "" });
                setImage(null);
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <h3>Users</h3>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                border: "1px solid #ccc",
                margin: "10px",
                padding: "10px",
                width: "200px",
              }}
            >
              <img
                src={`${API}/uploads/${user.image}`}
                alt={user.name}
                style={{ width: "100%", height: "auto" }}
              />
              <h4>{user.name}</h4>
              <p>{user.email}</p>
              <button style={{marginRight: '5px'}} onClick={() => handleEdit(user)}>Edit</button>
              <button onClick={() => handleDelete(user.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default  Sqltowimage;
