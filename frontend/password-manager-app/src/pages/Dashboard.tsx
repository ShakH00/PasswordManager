import { useState } from "react";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import UserInfoTab from "../components/UserInfoTab";
import PresetServiceTab from "../components/PresetServiceTab";
import CustomServiceTab from "../components/CustomServiceTab";

const Dashboard = () => {
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("user");
  // Later: on creation or edit make api call
  // customServices should come from a fetch() call
  const [customServices, setCustomServices] = useState<
    {
      id: string;
      name: string;
      username: string;
      password: string;
      icon?: string;
    }[]
  >([]);

  const isEditingNewService = customServices.some(
    (s) => s.name.trim().toLowerCase() === "untitled service"
  );

  // Later: POST to backend
  const addCustomService = () => {
    const id = crypto.randomUUID(); // Or use backend-generated ID later
    const newService = {
      id,
      name: "Untitled Service",
      username: "",
      password: "",
      icon: undefined,
    };
    setCustomServices((prev) => [newService, ...prev]);
    setSelectedTab(`custom-${id}`);
  };

  // Should be backend ready
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Later: fetch from backend after login
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    profile_path: null,
    password: "",
  });

  // Later: fetch from backend after login with useEffect()
  const [presetData, setPresetData] = useState<
    Record<string, { username: string; password: string } | null>
  >({
    google: null,
    outlook: null,
    facebook: null,
    youtube: null,
    instagram: null,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(data.error || "Failed to fetch user info");
        } else {
          setUserInfo({
            username: data.username,
            email: data.email,
            profile_path: data.profile_path,
            password: "placeholder", // placeholder, not sent from backend
          });
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="flex bg-gradient-to-r from-blue-200 to-indigo-100">
      <Sidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        customServices={customServices}
        addCustomService={addCustomService}
        logout={logout}
        isEditingNewService={isEditingNewService}
        isEditingCustomService={editingCustomId !== null}
      />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Current Tab: {selectedTab}</h2>
        {/* Render content here based on selectedTab */}
        {selectedTab === "user" && (
          <UserInfoTab
            username={userInfo.username}
            email={userInfo.email}
            password={userInfo.password}
            // Later: replace with api call
            updatePassword={(newPass) =>
              setUserInfo((prev) => ({ ...prev, password: newPass }))
            }
          />
        )}
        {["google", "outlook", "facebook", "youtube", "instagram"].includes(
          selectedTab
        ) && (
          <PresetServiceTab
            serviceName={
              selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)
            }
            savedCredentials={presetData[selectedTab]}
            // onSave will be a PUT request
            onSave={(credentials) =>
              setPresetData((prev) => ({ ...prev, [selectedTab]: credentials }))
            }
            // onReset will be a DELETE request
            onReset={() =>
              setPresetData((prev) => ({ ...prev, [selectedTab]: null }))
            }
          />
        )}
        {selectedTab.startsWith("custom-") &&
          (() => {
            const serviceId = selectedTab.replace("custom-", "");
            const service = customServices.find((s) => s.id === serviceId);
            if (!service) return null;

            return (
              <CustomServiceTab
                serviceId={serviceId}
                service={service}
                existingNames={customServices
                  .filter((s) => s.id !== serviceId)
                  .map((s) => s.name.trim().toLowerCase())}
                onSave={(updated) => {
                  setCustomServices((prev) =>
                    prev.map((s) =>
                      s.id === serviceId ? { ...s, ...updated } : s
                    )
                  );
                  setEditingCustomId(null);
                }}
                onDelete={() => {
                  setCustomServices((prev) =>
                    prev.filter((s) => s.id !== serviceId)
                  );
                  setEditingCustomId(null);
                }}
                setEditingCustomId={setEditingCustomId}
              />
            );
          })()}
      </main>
    </div>
  );
};

export default Dashboard;
