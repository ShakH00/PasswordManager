import { useState } from "react";
import { User, LogOut, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// Later: fetch users saved info for each preset
const presetServices = [
  { name: "Outlook", icon: "/outlook_logo.png" },
  { name: "Google", icon: "/google_logo.png" },
  { name: "Instagram", icon: "/instagram_logo.png" },
  { name: "Facebook", icon: "/facebook_logo.png" },
  { name: "Youtube", icon: "/youtube_logo.png" },
];

const Sidebar = ({
  selectedTab,
  setSelectedTab,
  customServices,
  addCustomService,
  logout,
  isEditingNewService,
  isEditingCustomService,
}: {
  selectedTab: string;
  isEditingNewService: boolean;
  isEditingCustomService: boolean;
  setSelectedTab: (tab: string) => void;
  customServices: {
    id: string;
    name: string;
    icon?: string;
  }[];
  addCustomService: () => void;
  logout: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`h-screen bg-white shadow-lg flex flex-col justify-between transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 p-4">
          <img src="/lock.png" alt="logo" className="h-8 w-8" />
          {isOpen && (
            <h1 className="text-xl font-bold text-gray-800">SecuroPass</h1>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 w-full flex justify-end"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Tabs */}
        <button
          onClick={() => {
            if (isEditingCustomService) return;
            setSelectedTab("user");
          }}
          className={`flex items-center w-full px-4 py-2 hover:bg-blue-50 ${
            selectedTab === "user" ? "bg-blue-100 font-semibold" : ""
          }`}
        >
          <User className="mr-2" size={18} />
          {isOpen && "User Info"}
        </button>

        {/* Divider */}
        <hr className="my-2 border-gray-300" />

        {/* Preset Services */}
        {presetServices.map((service) => (
          <button
            key={service.name}
            onClick={() => {
              if (isEditingCustomService) return;
              setSelectedTab(service.name.toLowerCase());
            }}
            className={`flex items-center w-full px-4 py-2 hover:bg-blue-50 ${
              selectedTab === service.name.toLowerCase()
                ? "bg-blue-100 font-semibold"
                : ""
            }`}
          >
            <img
              src={service.icon}
              alt={service.name}
              className="h-5 w-6 mr-5"
            />
            {isOpen && service.name}
          </button>
        ))}

        {/* Divider */}
        <hr className="my-2 border-gray-300" />

        {/* Add Custom Service */}
        <button
          onClick={addCustomService}
          className={`flex items-center w-full px-4 py-2 text-blue-600 hover:bg-blue-50 ${
            isEditingNewService ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isEditingNewService}
        >
          <Plus className="mr-2" size={18} />
          {isOpen && "Add New Service"}
        </button>

        {/* Custom Services */}
        {customServices.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              if (isEditingCustomService) return;
              setSelectedTab(`custom-${service.id}`);
            }}
            className={`flex items-center w-full px-4 py-2 hover:bg-blue-50 ${
              selectedTab === `custom-${service.id}`
                ? "bg-blue-100 font-semibold"
                : ""
            }`}
          >
            {/* Show uploaded icon or fallback emoji */}
            {service.icon ? (
              <img
                src={service.icon}
                alt="icon"
                className="h-5 w-5 mr-3 rounded object-contain"
              />
            ) : (
              <span className="mr-3">🛠️</span>
            )}
            {isOpen && service.name}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-300 rounded-md"
        >
          <LogOut className="mr-2" size={18} />
          {isOpen && "Log Out"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
