import { useState, useMemo } from "react";
import "../styles.css";

export default function DemandsTable({ demands }) {
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchText.trim()) return demands;
    const text = searchText.toLowerCase();

    return demands.filter((d) =>
      (d.role || "").toLowerCase().includes(text) ||
      (d.location || "").toLowerCase().includes(text) ||
      (d.status || "").toLowerCase().includes(text) ||
      (d.account_id || "").toString().includes(text) ||
      (d.project_id || "").toString().includes(text)
    );
  }, [searchText, demands]);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="table-container">

      {/* Search + Page Size */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
        <input
          type="text"
          placeholder="Search demands..."
          value={searchText}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchText(e.target.value);
          }}
          style={{
            padding: "0.5rem",
            border: "1px solid #cbd5e1",
            borderRadius: "0.375rem",
            width: "250px",
          }}
        />

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          style={{
            padding: "0.5rem",
            border: "1px solid #cbd5e1",
            borderRadius: "0.375rem",
          }}
        >
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Role</th>
              <th>Location</th>
              <th>Status</th>
              <th>Probability</th>
              <th>Allocation %</th>
              <th>Billing Rate</th>
              <th>Start Date</th>
              <th>End</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="9" className="table-empty">No demands found.</td>
              </tr>
            ) : (
              paginated.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.role}</td>
                  <td>{d.location}</td>
                  <td>{d.status}</td>
                  <td>{d.probability}</td>
                  <td>{d.allocationpercentage}</td>
                  <td>{d.billingrate}</td>
                  <td>{d.originalstartdate?.slice(0, 10)}</td>
                  <td>{d.allocationenddate?.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION BUTTONS */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20, gap: 20 ,paddingBottom:20}}>
        <button
          disabled={currentPage === 1}
          className="page-btn"
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        <b>Page {currentPage} of {totalPages}</b>

        <button
          disabled={currentPage === totalPages}
          className="page-btn"
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
