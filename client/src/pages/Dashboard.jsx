import { useState, useEffect } from 'react';
import EmployeeTable from '../components/EmployeeTable';
import AISearchBar from '../components/AISearchBar';
import TeamChart from '../components/TeamChart';
import Analytics from '../components/Analytics';
import EmployeeProfileModal from '../components/EmployeeProfileModal';
import ProjectsDashboard from '../components/ProjectsDashboard';
import DemandMatching from '../components/DemandMatching';
import SearchResults from '../components/SearchResults';
import DemandSearchResults from '../components/DemandSearchResults';
import DemandDetailsModal from '../components/DemandDetailsModal';
import '../styles.css';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [demandResults, setDemandResults] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState(null);
  const [selectedDemand, setSelectedDemand] = useState(null);

  /** 🔥 Excel Upload Modal States */
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [selectedTable, setSelectedTable] = useState("");
  const [newTableName, setNewTableName] = useState("");

  /** NEW — dynamic tables */
  const [availableTables, setAvailableTables] = useState([]);

  /** Fetch tables whenever modal opens */
  useEffect(() => {
    if (showUploadModal) {
      fetch("http://localhost:8000/tables")
        .then(res => res.json())
        .then(data => setAvailableTables(data.tables || []))
        .catch(err => console.error("Failed to load tables", err));
    }
  }, [showUploadModal]);

  /** Excel Upload Handler */
  const handleExcelUpload = async () => {
    if (!excelFile) return alert("Please upload an Excel file");
    const tableName = selectedTable || newTableName;
    if (!tableName) return alert("Select or enter a table name");

    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("tableName", tableName);

    try {
      const response = await fetch("http://localhost:8000/upload-excel", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(data.message || "Uploaded successfully!");

      setShowUploadModal(false);
      setExcelFile(null);
      setSelectedTable("");
      setNewTableName("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  /** Fetch employees on mount */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/employees');
        if (!response.ok) throw new Error('Failed to fetch employees');

        const data = await response.json();
        setEmployees(data);
        setFilteredEmployees(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  /** AI Search Handler */
  const handleAISearch = async (taskDescription, useSql = false, target = 'employees') => {
    if (!taskDescription.trim()) {
      setFilteredEmployees(employees);
      setSearchPerformed(false);
      setLastQuery('');
      setDemandResults(null);
      return;
    }

    try {
      setSearching(true);
      setSearchPerformed(true);
      setLastQuery(taskDescription);
      setError(null);
      setActiveTab('search');

      const params = new URLSearchParams();
      params.append('task_description', taskDescription);

      let endpoint = '/employees/ai-search';
      if (useSql) {
        endpoint = target === 'demands' ? '/demands/ai-sql-search' : '/employees/ai-sql-search';
      }

      const response = await fetch(`http://localhost:8000${endpoint}?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'AI search failed');
      }

      const results = await response.json();
      if (useSql && target === 'demands') {
        setDemandResults(results);
        setFilteredEmployees([]);
      } else {
        setFilteredEmployees(results);
        setDemandResults(null);
      }
    } catch (err) {
      setError(`AI Search Error: ${err.message}`);
      console.error('Error during AI search:', err);
      setFilteredEmployees([]);
      setDemandResults(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="dashboard-bg min-h-screen">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="flex items-center gap-3">
            <div className="logo-badge">D</div>
            <div className="header-title">
              <h1>Dynamic Demand</h1>
              <p>Employee Intelligence Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar + Upload Button */}
      <div className="tab-navigation" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={() => setActiveTab('search')} className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}>AI Search</button>
        <button onClick={() => setActiveTab('analytics')} className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}>Analytics</button>
        <button onClick={() => setActiveTab('projects')} className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}>Projects</button>
        <button onClick={() => setActiveTab('hiring')} className={`tab-button ${activeTab === 'hiring' ? 'active' : ''}`}>Hiring</button>

        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            marginLeft: "auto",
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Upload Excel
        </button>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === "search" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <AISearchBar onSearch={handleAISearch} isLoading={searching} />
            {!searching && demandResults && (
              <DemandSearchResults demands={demandResults.rows || []} generatedSql={demandResults.generated_sql} onDemandClick={setSelectedDemand} />
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Analytics employees={employees} onEmployeeClick={setSelectedEmployee} expandedTeam={selectedTeamName} />
            <TeamChart employees={employees} onTeamClick={setSelectedTeamName} />
            <EmployeeTable employees={employees} onEmployeeClick={setSelectedEmployee} />
          </div>
        )}

        {activeTab === "projects" && <ProjectsDashboard />}
        {activeTab === "hiring" && <DemandMatching employees={employees} />}
      </main>

      {/* Employee Modal */}
      {selectedEmployee && (
        <EmployeeProfileModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}

      {/* Demand Modal */}
      {selectedDemand && (
        <DemandDetailsModal demand={selectedDemand} onClose={() => setSelectedDemand(null)} />
      )}

      {/* Excel Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "420px",
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>Upload Excel File</h2>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setExcelFile(e.target.files[0])}
              className="upload-input"
            />

            <label>Select Existing Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => { setSelectedTable(e.target.value); setNewTableName(""); }}
              className="upload-select"
            >
              <option value="">-- Choose table --</option>
              {availableTables.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div className="or-divider">OR</div>

            <input
              type="text"
              placeholder="Enter new table name"
              value={newTableName}
              onChange={(e) => { setNewTableName(e.target.value); setSelectedTable(""); }}
              className="upload-input"
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "0.375rem",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleExcelUpload}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#10b981",
                  color: "white",
                  borderRadius: "0.375rem",
                  fontWeight: 600,
                }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 Dynamic Demand. Professional Employee Intelligence.</p>
        </div>
      </footer>
    </div>
  );
}
