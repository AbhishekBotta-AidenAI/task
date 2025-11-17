import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import '../styles.css';

export default function SearchResults({ employees, query, onEmployeeClick }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  
  if (!employees || employees.length === 0) {
    return null;
  }

  // Calculate team distribution
  const teamStats = employees.reduce((acc, emp) => {
    const existing = acc.find(t => t.name === emp.team);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: emp.team, value: 1 });
    }
    return acc;
  }, []);

  // Calculate availability distribution
  const availabilityStats = employees.reduce((acc, emp) => {
    const existing = acc.find(a => a.name === emp.availability);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: emp.availability, value: 1 });
    }
    return acc;
  }, []);

  // Calculate skill distribution (top skills)
  const skillStats = {};
  employees.forEach(emp => {
    emp.skills.forEach(skill => {
      skillStats[skill] = (skillStats[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Calculate average strength
  const avgStrength = Math.round(
    employees.reduce((sum, emp) => sum + emp.strength, 0) / employees.length
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
  const AVAILABILITY_COLORS = {
    'Available': '#10b981',
    'Partially Available': '#f59e0b',
    'Not Available': '#ef4444'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Total Results</div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginTop: '0.5rem' }}>
            {employees.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            matching "{query}"
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Avg Strength</div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginTop: '0.5rem' }}>
            {avgStrength}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            team capability
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Teams Involved</div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginTop: '0.5rem' }}>
            {teamStats.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            unique teams
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>Available Now</div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginTop: '0.5rem' }}>
            {employees.filter(e => e.availability === 'Available').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            ready to assign
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Team Distribution */}
        <div className="chart-card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Team Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={teamStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(entry) => setSelectedTeam(entry.name)}
                style={{ cursor: 'pointer' }}
              >
                {teamStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    opacity={selectedTeam === null || selectedTeam === entry.name ? 1 : 0.3}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} employee(s)`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          {selectedTeam && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Employees in {selectedTeam}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {employees.filter(e => e.team === selectedTeam).map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => onEmployeeClick && onEmployeeClick(emp)}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{emp.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                      {emp.availability}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e2e8f0',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Availability Distribution */}
        <div className="chart-card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Availability Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={availabilityStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(entry) => setSelectedAvailability(entry.name)}
                style={{ cursor: 'pointer' }}
              >
                {availabilityStats.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={AVAILABILITY_COLORS[entry.name]}
                    opacity={selectedAvailability === null || selectedAvailability === entry.name ? 1 : 0.3}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} employee(s)`} />
            </PieChart>
          </ResponsiveContainer>
          {selectedAvailability && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                {selectedAvailability} Employees
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {employees.filter(e => e.availability === selectedAvailability).map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => onEmployeeClick && onEmployeeClick(emp)}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{emp.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                      {emp.team}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedAvailability(null)}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e2e8f0',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Skills */}
      <div className="chart-card">
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Top Skills in Results</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {topSkills.map((skill, idx) => (
            <div key={skill.name} style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b' }}>
                {skill.name}
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: COLORS[idx % COLORS.length],
                marginTop: '0.5rem'
              }}>
                {skill.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                employees
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
