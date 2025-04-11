import { useState } from "react";
import { Info } from "lucide-react";

interface UserInfoTabProps {
  username: string;
  email: string;
  password: string;
}

const UserInfoTab = ({ username, email }: UserInfoTabProps) => {
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password.");
      } else {
        setSuccess("Password updated successfully.");
        setEditing(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-lg w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Account Information
      </h2>

      <div className="mb-4">
        <label className="block text-gray-800 font-medium">Username</label>
        <div className="flex items-center gap-4">
          <p className="text-gray-800 mt-1 bg-gray-300 pl-2 py-1 pr-2 rounded">
            {username}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Email</label>
        <div className="flex items-center gap-4">
          <p className="text-gray-800 mt-1 bg-gray-300 pl-2 py-1 pr-2 rounded">
            {email}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium flex items-center gap-1">
          Password
          <span className="relative group cursor-help">
            <Info size={16} className="text-gray-500" />
            <span className="absolute left-6 top-1 w-max bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
              Account password is hidden for security purposes. It is so if{" "}
              <br />
              someone hacks into your account without directly knowing your
              <br />
              password they won't be able to change your password easily,
              <br />
              as resetting your account password requires you knowing what
              <br />
              your account password is.
            </span>
          </span>
        </label>
        {!editing ? (
          <p className="text-gray-700 text-sm mt-1">
            User is not permitted to explicitly view their account password.
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded mt-2"
              required
            />
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
            {success && (
              <p className="text-green-600 text-sm mt-1">{success}</p>
            )}
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
