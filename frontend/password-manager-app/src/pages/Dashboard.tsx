import { useState } from "react";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import UserInfoTab from "../components/UserInfoTab";
import PresetServiceTab from "../components/PresetServiceTab";
import CustomServiceTab from "../components/CustomServiceTab";
import PasswordUnlockModal from "../components/PasswordUnlockModal";

const Dashboard = () => {
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("user");
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [vaultId, setVaultId] = useState<number | null>(null);
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

  const addCustomService = async () => {
    if (!vaultId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/vaults/${vaultId}/passwords`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: "Untitled Service",
            url: "", // user can add/edit later
            username: "",
            password: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to create custom service:", data.error);
      } else {
        const newService = {
          id: data.password.pid.toString(),
          name: data.password.name,
          username: data.password.username,
          password: "", // not returned from backend
          icon: undefined,
        };
        setCustomServices((prev) => [newService, ...prev]);
        setSelectedTab(`custom-${newService.id}`);
      }
    } catch (err) {
      console.error("Error adding custom service:", err);
    }
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
    Record<string, { pid: number; username: string; password: string } | null>
  >({
    google: null,
    outlook: null,
    facebook: null,
    youtube: null,
    instagram: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUserInfo = async () => {
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
            password: "placeholder", // we don't get password from backend
          });

          // Fetch vault after getting user info
          await fetchVault(token);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    const fetchVault = async (token: string) => {
      try {
        const response = await fetch("http://localhost:5000/vaults", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const vaults = await response.json();

        if (!response.ok) {
          console.error(vaults.error || "Failed to fetch vault");
        } else if (vaults.length > 0) {
          const vid = vaults[0].vid;
          console.log("Fetched Vault ID:", vid);
          setVaultId(vid);
          fetchVaultPasswords(vid, token); // fetch the passwords now
        }
      } catch (err) {
        console.error("Error fetching vault:", err);
      }
    };

    const fetchVaultPasswords = async (vid: number, token: string) => {
      try {
        const response = await fetch(
          `http://localhost:5000/vaults/${vid}/passwords`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(data.error || "Failed to fetch passwords");
        } else {
          console.log("Vault Passwords:", data);

          const presetKeys = [
            "google",
            "youtube",
            "facebook",
            "instagram",
            "outlook",
          ];
          const newPresetData: typeof presetData = {};
          const newCustomServices: typeof customServices = [];

          data.forEach((entry: any) => {
            const nameKey = entry.name.trim().toLowerCase();

            if (presetKeys.includes(nameKey)) {
              newPresetData[nameKey] = {
                pid: entry.pid,
                username: entry.username,
                password: entry.password,
              };
            } else {
              newCustomServices.push({
                id: entry.pid.toString(),
                name: entry.name,
                username: entry.username,
                password: entry.password,
                icon: undefined,
              });
            }
          });

          setPresetData(newPresetData);
          setCustomServices(newCustomServices);
        }
      } catch (err) {
        console.error("Error fetching passwords:", err);
      }
    };

    fetchUserInfo();
  }, []);

  {
    showUnlockModal && (
      <PasswordUnlockModal
        onUnlock={() => {
          setPasswordUnlocked(true);
          setShowUnlockModal(false);
        }}
        onClose={() => setShowUnlockModal(false)}
      />
    );
  }

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
            onSave={async (credentials) => {
              const current = presetData[selectedTab];
              if (!current) return;
              const token = localStorage.getItem("token");
              if (!token) return;

              try {
                const response = await fetch(
                  `http://localhost:5000/passwords/${current.pid}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      name:
                        selectedTab.charAt(0).toUpperCase() +
                        selectedTab.slice(1),
                      url: `https://${selectedTab}.com`, // or a real mapping later
                      username: credentials.username,
                      password: credentials.password,
                    }),
                  }
                );

                if (!response.ok) {
                  console.error("Failed to update preset password.");
                } else {
                  setPresetData((prev) => ({
                    ...prev,
                    [selectedTab]: {
                      pid: current.pid,
                      username: credentials.username,
                      password: credentials.password,
                    },
                  }));
                }
              } catch (err) {
                console.error("Error saving preset password:", err);
              }
            }}
            onReset={async () => {
              const current = presetData[selectedTab];
              if (!current) return;
              const token = localStorage.getItem("token");
              if (!token) return;

              try {
                const response = await fetch(
                  `http://localhost:5000/passwords/${current.pid}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      name:
                        selectedTab.charAt(0).toUpperCase() +
                        selectedTab.slice(1),
                      url: `https://${selectedTab}.com`,
                      username: "", // default username
                      password: "", // reset password
                    }),
                  }
                );

                if (!response.ok) {
                  console.error("Failed to reset preset password.");
                } else {
                  setPresetData((prev) => ({
                    ...prev,
                    [selectedTab]: {
                      pid: current.pid,
                      username: "",
                      password: "",
                    },
                  }));
                }
              } catch (err) {
                console.error("Error resetting preset password:", err);
              }
            }}
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
                onSave={async (updated) => {
                  const token = localStorage.getItem("token");
                  if (!token) return;

                  const pid = parseInt(serviceId);
                  try {
                    const response = await fetch(
                      `http://localhost:5000/passwords/${pid}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          name: updated.name,
                          url: "", // expose this in UI later
                          username: updated.username,
                          password: updated.password,
                        }),
                      }
                    );

                    if (!response.ok) {
                      console.error("Failed to update custom service.");
                    } else {
                      setCustomServices((prev) =>
                        prev.map((s) =>
                          s.id === serviceId ? { ...s, ...updated } : s
                        )
                      );
                      setEditingCustomId(null);
                    }
                  } catch (err) {
                    console.error("Error saving custom service:", err);
                  }
                }}
                onDelete={async () => {
                  const token = localStorage.getItem("token");
                  if (!token) return;

                  try {
                    const response = await fetch(
                      `http://localhost:5000/passwords/${serviceId}`,
                      {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );

                    if (!response.ok) {
                      console.error("Failed to delete custom service.");
                      return;
                    }

                    setCustomServices((prev) =>
                      prev.filter((s) => s.id !== serviceId)
                    );
                    setEditingCustomId(null);
                  } catch (err) {
                    console.error("Error deleting custom service:", err);
                  }
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
