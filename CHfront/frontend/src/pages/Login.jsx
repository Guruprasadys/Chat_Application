import { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/login", form);

      console.log("Login Success:", res.data);

      login(res.data);
      navigate("/");
    } catch (err) {
      console.log("Login Error:", err.response?.data);
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-teal-500 to-emerald-600">

      {/* LOGIN CARD */}
      <div className="bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 rounded-3xl p-10 w-[400px]">

        {/* TITLE */}
        <h2 className="text-4xl font-extrabold text-center text-white mb-2">
          Welcome Back 👋
        </h2>

        <p className="text-center text-white/80 mb-8">
          Login to continue chatting
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL INPUT */}
          <div className="relative">
            <input
              type="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* PASSWORD INPUT */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />

            {/* SHOW PASSWORD BUTTON */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-600 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-black text-white font-semibold text-lg hover:bg-gray-900 transition duration-300 shadow-lg"
          >
            Login
          </button>

        </form>

        {/* REGISTER LINK */}
        <p className="text-center text-white mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold underline hover:text-gray-200"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}