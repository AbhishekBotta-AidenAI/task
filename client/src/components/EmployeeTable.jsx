import { useState, useMemo } from 'react';
import '../styles.css';

export default function EmployeeTable({
  employees,
  searchPerformed = false,
  query = '',
  onEmployeeClick
}) {
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getAvailabilityClass = (status) => {
    switch (status) {
      case 'Available': return 'status-available';
      case 'Partially Available': return 'status-partially-available';
      case 'Not Available': return 'status-not-available';
      default: return 'status-badge';
    }
  };

  const getStrengthClass = (strength) => {
    if (strength >= 90) return 'strength-green';
    if (strength >= 80) return 'strength-blue';
    return 'strength-amber';
  };

  /** -------------------------
   * SEARCH FILTER
   * ------------------------*/
  const filteredEmployees = useMemo(() => {
    if (!searchText.trim()) return employees;

    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.team.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.availability.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.skills.some((s) => s.toLowerCase().includes(searchText.toLowerCase())) ||
      emp.qualifications.some((q) => q.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, employees]);

  /** -------------------------
   * SORTING LOGIC
   * ------------------------*/
  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredEmployees];

    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredEmployees, sortField, sortOrder]);

  /** -------------------------
   * PAGINATION
   * ------------------------*/
  const totalPages = Math.ceil(sortedEmployees.length / pageSize);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedEmployees]);

  /** Change Sorting */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="table-container">

      {/* Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchText}
          onChange={(e) => { setCurrentPage(1); setSearchText(e.target.value); }}
          style={{
            padding: "0.5rem",
            border: "1px solid #cbd5e1",
            borderRadius: "0.375rem",
            width: "250px"
          }}
        />

        {/* Page size */}
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
          style={{
            padding: "0.5rem",
            border: "1px solid #cbd5e1",
            borderRadius: "0.375rem"
          }}
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                Name {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>

              <th>Skills</th>
              <th>Qualifications</th>

              <th
                onClick={() => handleSort("strength")}
                style={{ textAlign: "center", cursor: "pointer" }}
              >
                Score {sortField === "strength" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>

              <th
                onClick={() => handleSort("availability")}
                style={{ textAlign: "center", cursor: "pointer" }}
              >
                Status {sortField === "availability" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>

              <th
                onClick={() => handleSort("team")}
                style={{ textAlign: "center", cursor: "pointer" }}
              >
                Team {sortField === "team" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp) => (
                <tr key={emp.id} style={{ cursor: "pointer" }} onClick={() => onEmployeeClick && onEmployeeClick(emp)}>
                  <td className="table-name">{emp.name}</td>

                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {emp.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {emp.qualifications.map((qual, i) => (
                        <span key={i} className="qualification-text">
                          {qual}{i < emp.qualifications.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className={`strength-score ${getStrengthClass(emp.strength)}`}>
                    {emp.strength}%
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <span className={`status-badge ${getAvailabilityClass(emp.availability)}`}>
                      {emp.availability}
                    </span>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <span className="team-badge">{emp.team}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="table-empty">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          marginTop: "1rem"
        }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="page-btn"
          >
            Prev
          </button>

          <span style={{ fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
