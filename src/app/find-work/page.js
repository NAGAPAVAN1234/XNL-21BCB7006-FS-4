"use client"; // ✅ Mark as Client Component

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // ✅ Replace useRouter
import { FiSearch, FiFilter } from "react-icons/fi";
import dynamic from "next/dynamic";
import Loading from "@/components/Loading";

const NavBar = dynamic(() => import("@/components/NavBar"), {
  loading: () => <Loading />,
});

export default function FindWork() {
  const searchParams = useSearchParams(); // ✅ Use useSearchParams instead of useRouter
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract search parameters safely
  const filters = {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    budget: searchParams.get("budget") || "all",
  };

  useEffect(() => {
    fetchProjects();
  }, [filters.search, filters.category, filters.budget]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before fetching

      // Build query string
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.category !== "all") queryParams.append("category", filters.category);
      if (filters.budget !== "all") queryParams.append("budget", filters.budget);

      const apiUrl = `/api/projects?${queryParams.toString()}`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Search Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex items-center">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search projects..."
              defaultValue={filters.search}
              className="flex-1 p-2 border rounded-lg"
            />
          </div>

          {/* Projects List */}
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center text-red-600 py-4">{error}</div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <p className="text-2xl font-bold text-blue-600">${project.budget.minAmount}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">No Projects Found</div>
          )}
        </div>
      </div>
    </div>
  );
}
