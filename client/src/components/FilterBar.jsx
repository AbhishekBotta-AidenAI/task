import { useState } from 'react';

export default function FilterBar({ onFilter, employees }) {
  const [filters, setFilters] = useState({
    skill: '',
    availability: '',
    team: '',
  });

  const uniqueTeams = [...new Set(employees.map(emp => emp.team))];

  const handleSkillChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, skill: value });
    onFilter({ ...filters, skill: value });
  };

  const handleAvailabilityChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, availability: value });
    onFilter({ ...filters, availability: value });
  };

  const handleTeamChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, team: value });
    onFilter({ ...filters, team: value });
  };

  const handleReset = () => {
    setFilters({ skill: '', availability: '', team: '' });
    onFilter({ skill: '', availability: '', team: '' });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Skill Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Skill
          </label>
          <input
            type="text"
            placeholder="e.g., React, Python"
            value={filters.skill}
            onChange={handleSkillChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <select
            value={filters.availability}
            onChange={handleAvailabilityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Partially Available">Partially Available</option>
            <option value="Not Available">Not Available</option>
          </select>
        </div>

        {/* Team Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team
          </label>
          <select
            value={filters.team}
            onChange={handleTeamChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Teams</option>
            {uniqueTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
