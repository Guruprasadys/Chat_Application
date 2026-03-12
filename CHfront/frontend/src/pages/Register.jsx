import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    profilePic: ""
  });

  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(profileFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profileFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profilePicPath = "";

      if (profileFile) {
        const formData = new FormData();
        formData.append("file", profileFile);

        const uploadRes = await axios.post(
          "http://localhost:5000/api/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        profilePicPath = uploadRes.data.file;
      }

      await axios.post("http://localhost:5000/api/register", {
        ...form,
        profilePic: profilePicPath
      });

      alert("Registration successful! Please login.");
      navigate("/login");

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200">

      {/* CARD */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-10 w-[420px]">

        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Sign Up
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Create your account to start chatting
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* PROFILE IMAGE */}
          <div className="flex flex-col items-center">

            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-300 shadow mb-2">

              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                  Upload
                </div>
              )}

            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-gray-600"
            />

          </div>

          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* PHONE */}
          <input
            type="text"
            placeholder="Phone Number"
            required
            value={form.phoneNumber}
            onChange={(e) =>
              setForm({ ...form, phoneNumber: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl bg-purple-400 hover:bg-purple-500 text-white font-semibold transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-500 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}