import { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles.css';

const COLORS = {
  Frontend: '#3B82F6',
  Backend: '#10B981',
  'Full Stack': '#F59E0B',
  Infrastructure: '#EF4444',
  'AI/ML': '#8B5CF6',
};

const FRAMEWORK_COLORS = {
  React: '#61DAFB',
  Node: '#68A063',
  Python: '#3776AB',
  FastAPI: '#009688',
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  Docker: '#2496ED',
  AWS: '#FF9900',
  TensorFlow: '#FF6F00',
  PostgreSQL: '#336791',
  MongoDB: '#13AA52',
  GraphQL: '#E10098',
  Kubernetes: '#326CE5',
  DevOps: '#FF9900',
  CSS: '#1572B6',
  HTML: '#E34C26',
  'Machine Learning': '#FF6F00',
  'Data Analysis': '#1F77B4',
};

// Custom tooltip with enhanced styling
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 rounded-lg shadow-xl border border-gray-700 pointer-events-none">
        <p className="text-white font-semibold">{data.name}</p>
        <p className="text-blue-300">
          {data.value} {data.value > 1 ? 'members' : 'member'}
        </p>
      </div>
    );
  }
  return null;
};

const CustomFrameworkTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-3 rounded-lg shadow-xl border border-gray-700 pointer-events-none">
        <p className="text-white font-semibold">{data.name}</p>
        <p className="text-green-300">
          {data.value} {data.value > 1 ? 'developers' : 'developer'}
        </p>
      </div>
    );
  }
  return null;
};

export default function TeamChart({ employees, onTeamClick }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [hoveredTeam, setHoveredTeam] = useState(null);

  // Prepare team data for pie chart
  const teamData = employees.reduce((acc, emp) => {
    const existing = acc.find(item => item.name === emp.team);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: emp.team, value: 1 });
    }
    return acc;
  }, []);

  // Get team members and their frameworks
  const getTeamFrameworks = (teamName) => {
    const teamMembers = employees.filter(emp => emp.team === teamName);
    const frameworkCount = {};

    teamMembers.forEach(emp => {
      emp.skills.forEach(skill => {
        frameworkCount[skill] = (frameworkCount[skill] || 0) + 1;
      });
    });

    return Object.entries(frameworkCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 frameworks
  };

  const handlePieClick = (data) => {
    setSelectedTeam(data.name);
    onTeamClick(data.name);
  };

  const frameworkData = selectedTeam ? getTeamFrameworks(selectedTeam) : [];

  const renderCustomLabel = ({ name, value, cx, cy, midAngle }) => {
    return `${name} (${value})`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Main Charts Container */}
      <div className="charts-container">
        <div className="charts-grid">
          {/* Teams Pie Chart */}
          <div className="chart-section">
            <h3 className="chart-title">
              Team Distribution
            </h3>
            <p className="chart-subtitle">
              Click on any team to see their technologies
            </p>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={teamData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(state) => handlePieClick(state)}
                    onMouseEnter={(_, index) => setHoveredTeam(teamData[index]?.name)}
                    onMouseLeave={() => setHoveredTeam(null)}
                    animationBegin={0}
                    animationDuration={600}
                  >
                    {teamData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name] || '#888'}
                        opacity={
                          selectedTeam === entry.name
                            ? 1
                            : hoveredTeam === entry.name
                            ? 0.85
                            : 0.7
                        }
                        style={{
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '16px',
                    }}
                    formatter={(value) => (
                      <span style={{ color: '#475569', fontSize: '0.875rem' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Frameworks Pie Chart */}
          <div className="chart-section">
            <h3 className="chart-title">
              {selectedTeam ? `${selectedTeam} Team` : 'Technologies'}
            </h3>
            <p className="chart-subtitle">
              {selectedTeam
                ? `Technologies used by ${selectedTeam} developers`
                : 'Select a team to view'}
            </p>
            <div className="chart-content">
              {selectedTeam && frameworkData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={frameworkData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={600}
                    >
                      {frameworkData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={FRAMEWORK_COLORS[entry.name] || '#888'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomFrameworkTooltip />} />
                    <Legend
                      wrapperStyle={{
                        paddingTop: '16px',
                      }}
                      formatter={(value) => (
                        <span style={{ color: '#475569', fontSize: '0.875rem' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-placeholder">
                  <div className="chart-placeholder-text">
                    {selectedTeam ? 'Loading...' : 'Select a team above'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      {selectedTeam && (
        <div className="chart-button">
          <button
            onClick={() => setSelectedTeam(null)}
            className="chart-reset-button"
          >
            ← Back to All Teams
          </button>
        </div>
      )}
    </div>
  );
}
