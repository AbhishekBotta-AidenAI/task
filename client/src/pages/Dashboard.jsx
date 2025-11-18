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
  const [demands,setDemands] = useState([]);
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
  const [demandsLoading, setDemandsLoading] = useState(false);
  const [demandsError, setDemandsError] = useState(null);

  const [searchCollapsed, setSearchCollapsed] = useState(false);

  // Collapsible Sidebar
  const [collapsed, setCollapsed] = useState(false);

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [newTableName, setNewTableName] = useState("");

  /** Fetch tables when modal opens */
  useEffect(() => {
    if (showUploadModal) {
      fetch("http://localhost:8000/tables")
        .then(res => res.json())
        .then(data => setAvailableTables(data.tables || []));
    }
  }, [showUploadModal]);

  /** Fetch employees */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
          setLoading(true);
          const response = await fetch('http://localhost:8000/employees');
          const data = await response.json();
          setEmployees(data);
          setFilteredEmployees(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
    fetchEmployees();
  }, []);


  useEffect(() => {
  const fetchDemands = async () => {
    try {
      setDemandsLoading(true);
      setDemandsError(null);

      const res = await fetch("http://localhost:8000/demands");
      if (!res.ok) throw new Error("Failed to fetch demands");

      const data = await res.json();

      // always set `demands` state
      setDemands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading demands:", err);
      setDemandsError(err.message);
      setDemands([]);
    } finally {
      setDemandsLoading(false);
    }
  };

  fetchDemands();
}, []);




  /** AI Search */
  const handleAISearch = async (taskDescription, useSql = false, target = 'employees') => {
    if (!taskDescription.trim()) {
      setFilteredEmployees(employees);
      setSearchPerformed(false);
      setLastQuery('');
      setDemandResults(null);
      setSearchCollapsed(false);
      return;
    }

    try {
        setSearching(true);
        setSearchPerformed(true);
        setLastQuery(taskDescription);
        setActiveTab('search');

        const params = new URLSearchParams();
        params.append('task_description', taskDescription);

        let endpoint = '/employees/ai-search';
        if (useSql) endpoint = target === 'demands' ? '/demands/ai-sql-search' : '/employees/ai-sql-search';

        const response = await fetch(`http://localhost:8000${endpoint}?${params.toString()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const results = await response.json();
        setSearchCollapsed(true);

        if (useSql && target === 'demands') {
          setDemandResults(results);
          setFilteredEmployees([]);
        } else {
          setFilteredEmployees(results);
        }
      } catch (err) {
        setError(`AI Search Error: ${err.message}`);
      } finally {
        setSearching(false);
      }
  };

  return (
    <div className="dashboard-bg min-h-screen" style={{ display: "flex" }}>

      {/* ====================== SIDEBAR ====================== */}
      <div
        style={{
          width: collapsed ? "70px" : "240px",
          background: "#000",
          color: "#fff",
          minHeight: "100vh",
          padding: collapsed ? "1rem 0.4rem" : "1.5rem 1rem",
          position: "fixed",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          transition: "width .3s ease, padding .3s ease"
        }}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
            alignSelf: collapsed ? "center" : "flex-end",
            marginBottom: "1rem",
          }}
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>

        {/* Logo */}
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <div style={{
              background: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#000",
              fontWeight: 700,
              fontSize: 20
            }}>D</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Dynamic Demand</h2>
              <p style={{ margin: 0, fontSize: "12px", opacity: .7 }}>Employee Intelligence</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          {collapsed ? "🔍" : "AI Search"}
        </button>

        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          {collapsed ? "📊" : "Analytics"}
        </button>

        <button
          className={`tab-button ${activeTab === 'hiring' ? 'active' : ''}`}
          onClick={() => setActiveTab('hiring')}
        >
          {collapsed ? "🎯" : "Hiring"}
        </button>

        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            marginTop: "auto",
            padding: "0.75rem",
            background: "#fff",
            color: "#000",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: 700,
            border: "none",
          }}
        >
          {collapsed ? "⬆️" : "Upload Excel"}
        </button>
      </div>

      {/* ====================== MAIN CONTENT ====================== */}
      <div
        style={{
          marginLeft: collapsed ? "90px" : "250px",
          // padding: "2rem",
          width: "100%",
          transition: "margin-left .3s ease",
          paddingRight:"150px"
        }}
      >
        <main className="main-content">
          {activeTab === "search" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem"}}>
              {searchCollapsed ? (
                <div
                  onClick={() => setSearchCollapsed(false)}
                  style={{
                    background: "white",
                    padding: "0.75rem 1rem",
                    borderRadius: "999px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    cursor: "pointer",
                    width: "fit-content"
                  }}
                >
                  🔍 {lastQuery}
                </div>
              ) : (
                <AISearchBar onSearch={handleAISearch} isLoading={searching} />
              )}

              {!searching && demandResults && (
                <DemandSearchResults
                  demands={demandResults.rows || []}
                  generatedSql={demandResults.generated_sql}
                  onDemandClick={setSelectedDemand}
                />
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <Analytics employees={employees} onEmployeeClick={setSelectedEmployee} expandedTeam={selectedTeamName} />
              <TeamChart employees={employees} onTeamClick={setSelectedTeamName} />
              <EmployeeTable demands={demands} onEmployeeClick={setSelectedEmployee} />
            </div>
          )}

          {activeTab === "hiring" && (
            <DemandMatching employees={employees} />
          )}
        </main>
      </div>

      {/* ====================== MODALS ====================== */}
      {selectedEmployee && (
        <EmployeeProfileModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}

      {selectedDemand && (
        <DemandDetailsModal demand={selectedDemand} onClose={() => setSelectedDemand(null)} />
      )}

      {/* Upload Excel Modal */}
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
    </div>
  );
}
