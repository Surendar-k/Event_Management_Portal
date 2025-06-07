import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ksrLogo from "../../assets/ksr-logo.png"; // Ensure this exists

const users = [
    {email:"admin@gmail.com", role:"faculty"},
  { email: "nagarajan@shanmugha.edu.in", role: "faculty" },
  { email: "sivakumar@shanmugha.edu.in", role: "faculty" },
  { email: "hod.ai_ds@shanmugha.edu.in", role: "hod" },
  { email: "hod.cse@shanmugha.edu.in", role: "hod" },
  { email: "cso@shanmugha.edu.in", role: "cso" },
  { email: "principal@shanmugha.edu.in", role: "principal" },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);
      navigate("/create-event");
    } else {
      setError("Unauthorized email.");
    }
  };

  return (
    <div className="min-h-screen bg-[#575757] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-[#ddd] rounded-xl shadow-xl p-10">
        {/* Branding */}
        <div className="flex flex-col items-center mb-6">
          <img src={ksrLogo} alt="KSR Logo" className="w-20 h-20 mb-3" />
          <h1 className="text-3xl font-bold text-[#333] text-center">K.S.R. Educational Institution</h1>
          <p className="text-[#575757] text-sm text-center">Faculty & Admin Login Portal</p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-center font-medium bg-red-100 rounded-md py-2 px-4 mb-4">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-[#575757] text-sm font-medium mb-1">
              Institutional Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 border border-[#ccc] rounded-lg text-[#333] placeholder-[#aaa] bg-white focus:outline-none focus:ring-2 focus:ring-[#aaa]"
              placeholder="you@shanmugha.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[#575757] text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 border border-[#ccc] rounded-lg text-[#333] placeholder-[#aaa] bg-white focus:outline-none focus:ring-2 focus:ring-[#aaa]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#333] text-white text-lg font-semibold py-3 rounded-lg hover:bg-[#222] transition duration-200"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[#aaa]">
          &copy; {new Date().getFullYear()} K.S.R. Institutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
