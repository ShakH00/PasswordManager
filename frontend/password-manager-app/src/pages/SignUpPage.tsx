import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isStrongPassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{15,}$/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 15 characters and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
      } else {
        alert("Account created successfully!");
        navigate("/login");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-indigo-100 flex items-center justify-center">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-1 text-gray-800 bg-white px-6 py-3 rounded-full hover:bg-gray-100 shadow-lg"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Sign Up Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
      >
        {/* Header of form */}
        <div className="flex flex-col items-center mb-4">
          <img src="/lock.png" alt="SecuroPass logo" className="h-10 w-10" />
          <h1 className="text-3xl font-bold text-gray-800 mb-3">SecuroPass</h1>
          <hr className="border-t border-gray-300 w-full my-2" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Your Account
        </h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {password && (
          <ul className="text-xs text-gray-600 mt-1 ml-1 space-y-1">
            <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
              • At least one lowercase letter
            </li>
            <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
              • At least one uppercase letter
            </li>
            <li className={/\d/.test(password) ? "text-green-600" : ""}>
              • At least one number
            </li>
            <li className={/[\W_]/.test(password) ? "text-green-600" : ""}>
              • At least one special character
            </li>
            <li className={password.length >= 15 ? "text-green-600" : ""}>
              • At least 15 characters
            </li>
          </ul>
        )}

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Sign Up
        </button>
        <button
          onClick={() => navigate("/login")}
          className="pr-23 pl-23 text-sm text-blue-700 hover:underline"
        >
          Already have an account? Log in
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;
