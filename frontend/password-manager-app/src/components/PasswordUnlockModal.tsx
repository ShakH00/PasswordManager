import { useState } from "react";

interface Props {
  onUnlock: () => void;
  onClose: () => void;
}

const PasswordUnlockModal = ({ onUnlock, onClose }: Props) => {
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("http://localhost:5000/verify-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: inputPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to verify");
    } else {
      setError("");
      onUnlock();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Enter Account Password</h3>
        <input
          type="password"
          placeholder="Your account password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUnlock}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordUnlockModal;
