import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";

export default function AshaRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    village: "",
    district: "",
    preferred_language: "hindi",
    role: "asha_worker",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(form);
      alert("ASHA Worker Registered Successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">
          ASHA Worker Register
        </h2>

        <input name="full_name" placeholder="Full Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="village" placeholder="Village" onChange={handleChange} />
        <input name="district" placeholder="District" onChange={handleChange} />

        <button>Create ASHA Account</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}