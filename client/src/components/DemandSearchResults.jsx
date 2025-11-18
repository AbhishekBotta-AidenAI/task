import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import '../styles.css';

export default function DemandSearchResults({ demands, generatedSql, onDemandClick }) {
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("status");

  const [barXColumn, setBarXColumn] = useState("status");
  const [barGroupColumn, setBarGroupColumn] = useState("updatedOn");

  // -------------------------
  // ZERO RESULTS HANDLING
  // -------------------------
  if (!demands || demands.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          background: "white",
          borderRadius: "0.75rem",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "#475569"
        }}
      >
        ❌ No results found  
        <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.7 }}>
          Try adjusting your search query.
        </div>
      </div>
    );
  }

  // -------------------------
  // NORMAL PATH (RESULTS FOUND)
  // -------------------------

  // Columns available for charting
  const columns = [
    "status",
    "location",
    "role",
    "rolecode",
    "probability",
    "account_id",
    "project_id",
    "allocationpercentage",
    "resourcemapped",
    "revised",
    "originalstartdate",
    "allocationenddate",
    "comment",
    "addedby",
    "startmonth",
    "billingrate",
    "updatedon",
    "fulfillmentdate"
  ];

  // Colors
  const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"
  ];

  // PIE DATA
  const pieData = demands.reduce((acc, item) => {
    const key = item[selectedColumn] || "Unknown";
    const found = acc.find(e => e.name === key);
    if (found) found.value += 1;
    else acc.push({ name: key, value: 1 });
    return acc;
  }, []);

  // BAR DATA
  const barDataMap = {};
  demands.forEach(d => {
    const xVal = d[barXColumn] || "Unknown";
    const gVal = d[barGroupColumn] || "Unknown";

    if (!barDataMap[xVal]) barDataMap[xVal] = {};
    barDataMap[xVal][gVal] = (barDataMap[xVal][gVal] || 0) + 1;
  });

  const barChartData = Object.entries(barDataMap).map(([xValue, groups]) => ({
    name: xValue,
    ...groups,
  }));

  const barGroups = [...new Set(demands.map(d => d[barGroupColumn] || "Unknown"))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* --------- CHART ROW --------- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "1.5rem"
      }}>

        {/* ---------------- PIE CHART ---------------- */}
        <div className="chart-card">
          <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem" }}>
            {selectedColumn.toUpperCase()} Distribution
          </h3>

          {/* PIE SELECTOR */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Group by:</label>
            <select
              value={selectedColumn}
              onChange={(e) => {
                setSelectedColumn(e.target.value);
                setSelectedSlice(null);
              }}
              style={{
                marginLeft: "0.75rem",
                padding: "0.5rem",
                border: "1px solid #CBD5E1",
                borderRadius: "0.375rem",
              }}
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                onClick={(entry) => setSelectedSlice(entry.name)}
                style={{ cursor: "pointer" }}
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={COLORS[idx % COLORS.length]}
                    opacity={selectedSlice === null || selectedSlice === entry.name ? 1 : 0.3}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <Legend />
          </ResponsiveContainer>

          {selectedSlice && (
            <div style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f8fafc",
              borderRadius: "0.5rem"
            }}>
              <h4 style={{ fontWeight: 600 }}>{selectedSlice} Items</h4>

              <div style={{
                maxHeight: "250px",
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "0.5rem"
              }}>
                {demands
                  .filter(d => (d[selectedColumn] || "Unknown") === selectedSlice)
                  .map(d => (
                    <div
                      key={d.id}
                      onClick={() => onDemandClick && onDemandClick(d)}
                      style={{
                        padding: "0.75rem",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "white",
                        borderRadius: "0.375rem",
                        cursor: "pointer"
                      }}>
                      <strong>{d.role}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {d[selectedColumn]}
                      </div>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => setSelectedSlice(null)}
                style={{
                  marginTop: "0.75rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "0.375rem",
                  cursor: "pointer"
                }}>
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* ---------------- BAR CHART ---------------- */}
        <div className="chart-card">
          <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem" }}>
            Bar Comparison
          </h3>

          {/* SELECTORS */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>X-Axis:</label>
              <select
                value={barXColumn}
                onChange={(e) => setBarXColumn(e.target.value)}
                style={{ marginLeft: "0.5rem", padding: "0.3rem", borderRadius: "0.375rem" }}
              >
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Group:</label>
              <select
                value={barGroupColumn}
                onChange={(e) => setBarGroupColumn(e.target.value)}
                style={{ marginLeft: "0.5rem", padding: "0.3rem", borderRadius: "0.375rem" }}
              >
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BAR CHART */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              {barGroups.map((grp, idx) => (
                <Bar key={grp} dataKey={grp} fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
