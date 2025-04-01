import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-indigo-100 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 bg-blue-600">
        <div className="flex items-center gap-2">
          <img src="/lock.png" alt="SecuroPass Logo" className="h-12 w-12" />
          <h1 className="text-3xl font-bold text-white">SecuroPass</h1>
        </div>
        <div className="flex gap-6 text-sm items-center">
          <button
            onClick={() => navigate("/login")}
            className="bg-white hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full font-medium"
          >
            Sign In
          </button>
        </div>
      </nav>

      <section className="flex flex-col md:flex-row items-center justify-between px-1 mx-auto gap-12 min-h-[90vh]">
        {/* Text Content */}
        <div className="flex-1 flex flex-col justify-center text-center p-8">
          <p className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            Safe and secure password management for everyone.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            Click below to make your account now!
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 shadow-lg"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Image Full Height */}
        <div className="flex-1 h-full flex justify-center items-center p-8">
          <img
            src="/happy-family.jpg"
            alt="Password security illustration"
            className="h-4xl w-4xl rounded-lg shadow-lg"
          />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
