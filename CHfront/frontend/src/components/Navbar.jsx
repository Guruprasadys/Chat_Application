import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {

  const { user, logout } = useContext(AuthContext);

  return (

    <div className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 shadow-lg">

      <div className="max-w-screen-xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo / App Name */}

        <h1 className="text-2xl font-bold text-white tracking-wide cursor-pointer hover:opacity-90 transition">
          ChatSphere
        </h1>


        {/* Right Side */}

        <div className="flex items-center space-x-4">

          {/* Profile */}

          <div className="flex items-center space-x-3 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">

            <div className="relative">

              <img
                src={
                  user?.profilePic
                    ? `http://localhost:5000${user.profilePic}`
                    : "/photo.png"
                }
                alt="profile"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow"
              />

              {/* Online Status */}

              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>

            </div>

            {/* Username */}

            <span className="text-white font-medium text-sm">
              {user?.name || "User"}
            </span>

          </div>


          {/* Logout Button */}

          <button
            onClick={logout}
            className="bg-white text-indigo-600 font-semibold px-4 py-1.5 rounded-full shadow-md hover:bg-indigo-50 hover:scale-105 transition-all duration-200"
          >
            Logout
          </button>

        </div>

      </div>

    </div>

  );

}