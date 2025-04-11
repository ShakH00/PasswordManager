import { useState, useEffect } from "react";
import { Info } from "lucide-react";

interface PresetServiceTabProps {
  serviceName: string;
  savedCredentials: {
    username: string;
    password: string;
  } | null;
  onSave: (credentials: { username: string; password: string }) => void;
  onReset: () => void;
}

const PresetServiceTab = ({
  serviceName,
  savedCredentials,
  onSave,
  onReset,
}: PresetServiceTabProps) => {
  const [editing, setEditing] = useState(!savedCredentials); // default to edit if no data
  const [username, setUsername] = useState(savedCredentials?.username || "");
  const [password, setPassword] = useState(savedCredentials?.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [confirmAccountPassword, setConfirmAccountPassword] = useState("");

  const handleSave = () => {
    if (!username || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    onSave({ username, password });
    setEditing(false);
  };

  const handleReset = () => {
    setShowConfirmReset(false);
    onReset();
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEditing(true);
  };

  useEffect(() => {
    setUsername(savedCredentials?.username || "");
    setPassword(savedCredentials?.password || "");
    setConfirmPassword("");
    setError("");
    setEditing(!savedCredentials);
    setShowPassword(false);
    setShowConfirm(false);
    setShowConfirmReset(false);
  }, [serviceName, savedCredentials]);

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-lg w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{serviceName}</h2>

      {!editing ? (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">
              Username / Email
            </label>
            <div className="flex items-center gap-4">
              <p className="text-gray-800 mt-1 bg-gray-200 pl-2 py-1 pr-2 rounded">
                {username}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium flex items-center gap-1">
              Password
              <span className="relative group cursor-help">
                <Info size={16} className="text-gray-500" />
                <span className="absolute left-6 top-1 w-max bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                  Must enter account password to view saved password. <br />
                </span>
              </span>
            </label>
            <div className="flex items-center gap-4 mt-1">
              {showPassword ? (
                <>
                  <p className="text-gray-800 mt-1 bg-gray-200 pl-2 py-1 pr-2 rounded">
                    {password}
                  </p>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    onClick={() => setShowPassword(false)}
                  >
                    Hide
                  </button>
                </>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    type="password"
                    placeholder="Account password"
                    className="border px-2 py-1 rounded text-sm"
                    value={confirmAccountPassword}
                    onChange={(e) => setConfirmAccountPassword(e.target.value)}
                  />
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      if (!token) return;

                      try {
                        const res = await fetch(
                          "http://localhost:5000/verify-password",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              password: confirmAccountPassword,
                            }),
                          }
                        );

                        const result = await res.json();
                        if (!res.ok) {
                          alert(result.error || "Incorrect password.");
                        } else {
                          setShowPassword(true);
                        }
                      } catch (err) {
                        alert("Error verifying password.");
                      } finally {
                        setConfirmAccountPassword("");
                      }
                    }}
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Change Info
            </button>
            <button
              onClick={() => setShowConfirmReset(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">
              Username / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-blue-600 text-sm mt-1"
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium">
              Confirm Password
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </>
      )}

      {showConfirmReset && (
        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">
            Are you sure you want to reset credentials for{" "}
            <strong>{serviceName}</strong>? Any data lost by resetting cannot be
            recovered.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetServiceTab;
