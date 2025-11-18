import React, { useState, useEffect } from 'react';
import '../styles.css';

function TeamCard({ team, employees, onEmployeeClick, forceOpen }) {
  const [open, setOpen] = useState(Boolean(forceOpen));

  useEffect(() => {
    if (typeof forceOpen !== 'undefined') setOpen(Boolean(forceOpen));
  }, [forceOpen]);
  return (
    <div className="team-card">
      <div className="team-card-header" onClick={() => setOpen(prev => !prev)} style={{ cursor: 'pointer' }}>
        <div className="team-card-title">{team.name}</div>
        <div className="team-card-meta">{team.count} members • Avg {team.avgStrength}%</div>
      </div>
      {open && (
        <div className="team-card-body">
          {employees && employees.length() > 0 && employees.map(emp => (
            <div key={emp.id || emp.name} className="team-employee-row">
              <button className="link-button" onClick={() => onEmployeeClick && onEmployeeClick(emp)}>{emp.name}</button>
              <div className="employee-meta">{emp.role || ''} • {emp.availability}</div>
            </div>
          ))}
          {/* {employees.length === 0 && <div className="empty-note">No employees found</div>} */}
        </div>
      )}
    </div>
  );
}

export default function Analytics({ employees, onEmployeeClick, expandedTeam }) {
  // Calculate statistics
  const totalEmployees = employees.length;
  const availableCount = employees.filter(emp => emp.availability === 'Available').length;
  const partiallyAvailableCount = employees.filter(emp => emp.availability === 'Partially Available').length;
  const notAvailableCount = employees.filter(emp => emp.availability === 'Not Available').length;
  const avgStrength = (employees.reduce((sum, emp) => sum + emp.strength, 0) / totalEmployees).toFixed(0);

  // Team statistics
  const teamStats = employees.reduce((acc, emp) => {
    const existing = acc.find(item => item.name === emp.team);
    if (existing) {
      existing.count += 1;
      existing.avgStrength = ((existing.avgStrength * (existing.count - 1) + emp.strength) / existing.count).toFixed(0);
    } else {
      acc.push({ name: emp.team, count: 1, avgStrength: emp.strength });
    }
    return acc;
  }, []);

  // Skill statistics
  const skillStats = {};
  employees.forEach(emp => {
    emp.skills.forEach(skill => {
      skillStats[skill] = (skillStats[skill] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillStats)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Key Metrics */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>Key Metrics</h2>
        <div className="stats-grid">
          <div className="stat-card stat-card-blue">
            <div className="stat-label">Total Employees</div>
            <div className="stat-value stat-value-blue">{totalEmployees}</div>
            <div className="stat-subtitle">Active workforce</div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-label">Available</div>
            <div className="stat-value stat-value-green">{availableCount}</div>
            <div className="stat-subtitle">{((availableCount / totalEmployees) * 100).toFixed(0)}% of workforce</div>
            <div className="progress-bar">
              <div className="progress-fill progress-green" style={{ width: `${(availableCount / totalEmployees) * 100}%` }}></div>
            </div>
          </div>

          <div className="stat-card stat-card-amber">
            <div className="stat-label">Partially Available</div>
            <div className="stat-value stat-value-amber">{partiallyAvailableCount}</div>
            <div className="stat-subtitle">{((partiallyAvailableCount / totalEmployees) * 100).toFixed(0)}% of workforce</div>
            <div className="progress-bar">
              <div className="progress-fill progress-amber" style={{ width: `${(partiallyAvailableCount / totalEmployees) * 100}%` }}></div>
            </div>
          </div>

          <div className="stat-card stat-card-red">
            <div className="stat-label">Not Available</div>
            <div className="stat-value stat-value-red">{notAvailableCount}</div>
            <div className="stat-subtitle">{((notAvailableCount / totalEmployees) * 100).toFixed(0)}% of workforce</div>
            <div className="progress-bar">
              <div className="progress-fill progress-red" style={{ width: `${(notAvailableCount / totalEmployees) * 100}%` }}></div>
            </div>
          </div>

          <div className="stat-card stat-card-purple">
            <div className="stat-label">Avg Strength</div>
            <div className="stat-value stat-value-purple">{avgStrength}%</div>
            <div className="stat-subtitle">Team capability</div>
          </div>
        </div>
      </div>

      {/* Team Breakdown (click a team to see employees) */}
      {/* <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>Team Breakdown</h2>
        <div className="team-breakdown-grid">
          {teamStats.map((team, idx) => (
            <TeamCard
              key={team.name || idx}
              team={team}
              employees={employees.filter(e => e.team === team.name)}
              onEmployeeClick={onEmployeeClick}
              forceOpen={expandedTeam === team.name}
            />
          ))}
        </div>
      </div>  */}

      {/* Team Performance */}
      {/* <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>Team Performance</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {teamStats.map((team, idx) => (
            <div key={idx} className="team-performance">
              <div className="team-header">
                <div className="team-name">{team.name}</div>
                <div className="team-stats">
                  <div className="team-stat">
                    <div className="team-stat-label">Members</div>
                    <div className="team-stat-value">{team.count}</div>
                  </div>
                  <div className="team-stat">
                    <div className="team-stat-label">Avg Strength</div>
                    <div className="team-stat-value">{team.avgStrength}%</div>
                  </div>
                </div>
              </div>
              <div className="team-health-bar">
                <div className="team-health-fill" style={{ width: `${team.avgStrength}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Skills Distribution */}
      {/* <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>Top Skills</h2>
        <div className="skill-distribution">
          {topSkills.map((skill, idx) => (
            <div key={idx} className="skill-item">
              <div className="skill-name">{skill.skill}</div>
              <div className="skill-count">{skill.count} developers</div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Availability Breakdown */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>Availability Breakdown</h2>
        <div className="analytics-box">
          <div className="analytics-grid">
            <div className="analytics-item">
              <div className="analytics-item-label">Available Now</div>
              <div className="analytics-item-value" style={{ color: '#16a34a' }}>{availableCount}</div>
            </div>
            <div className="analytics-item">
              <div className="analytics-item-label">Partially Available</div>
              <div className="analytics-item-value" style={{ color: '#d97706' }}>{partiallyAvailableCount}</div>
            </div>
            <div className="analytics-item">
              <div className="analytics-item-label">Not Available</div>
              <div className="analytics-item-value" style={{ color: '#dc2626' }}>{notAvailableCount}</div>
            </div>
            <div className="analytics-item">
              <div className="analytics-item-label">Total</div>
              <div className="analytics-item-value" style={{ color: '#4f46e5' }}>{totalEmployees}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
