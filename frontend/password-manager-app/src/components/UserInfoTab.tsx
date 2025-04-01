import { useState } from "react";

interface UserInfoTabProps {
  username: string;
  password: string;
  updatePassword: (newPassword: string) => void;
}

const UserInfoTab = ({
  username,
  password,
  updatePassword,
}: UserInfoTabProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    updatePassword(newPassword);
    setEditing(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-lg w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Account Information
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Username</label>
        <div className="flex items-center gap-4">
          <p className="text-gray-800 mt-1 bg-gray-200 pl-2 py-1 pr-2 rounded">
            {username}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Password</label>
        {!editing ? (
          <div className="flex items-center gap-4">
            <p className="text-gray-800 mt-1 bg-gray-200 pl-2 py-1 pr-2 rounded">
              {showPassword ? password : "*".repeat(password.length)}
            </p>
            <button
              className="text-blue-600 text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        ) : (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded mt-2"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded mt-2"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </>
        )}
      </div>

      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Change Password
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setNewPassword("");
              setConfirmPassword("");
              setError("");
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default UserInfoTab;
