import { useState } from 'react';
import '../styles.css';

export default function DemandMatching({ employees }) {
  const [selectedPosition, setSelectedPosition] = useState(0);

  // Define open positions
  const openPositions = [
    {
      id: 1,
      title: 'Senior React Developer',
      requirements: ['React', 'TypeScript', 'Tailwind CSS'],
      priority: 'High',
      salary: '120-150K',
    },
    {
      id: 2,
      title: 'Backend Engineer',
      requirements: ['Python', 'FastAPI', 'PostgreSQL'],
      priority: 'High',
      salary: '130-160K',
    },
    {
      id: 3,
      title: 'DevOps Specialist',
      requirements: ['Docker', 'Kubernetes', 'AWS'],
      priority: 'Medium',
      salary: '110-140K',
    },
    {
      id: 4,
      title: 'ML Engineer',
      requirements: ['Python', 'TensorFlow', 'Machine Learning'],
      priority: 'Medium',
      salary: '140-180K',
    },
  ];

  const position = openPositions[selectedPosition];

  // Calculate match score
  const calculateMatchScore = (employee, requiredSkills) => {
    const matchedSkills = employee.skills.filter(skill =>
      requiredSkills.some(req =>
        req.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(req.toLowerCase())
      )
    ).length;

    const baseScore = (matchedSkills / requiredSkills.length) * 100;
    const availabilityBonus = employee.availability === 'Available' ? 15 : employee.availability === 'Partially Available' ? 5 : 0;
    const strengthBonus = (employee.strength / 100) * 30;

    return Math.min(100, Math.floor(baseScore + availabilityBonus + strengthBonus));
  };

  // Get matched candidates
  const matchedCandidates = employees
    .map(emp => ({
      ...emp,
      matchScore: calculateMatchScore(emp, position.requirements),
    }))
    .filter(emp => emp.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const getScoreClass = (score) => {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    return 'score-poor';
  };

  const getMatchCircleClass = (score) => {
    if (score >= 85) return 'match-circle-high';
    if (score >= 70) return 'match-circle-medium';
    return 'match-circle-low';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#dc2626';
    if (priority === 'Medium') return '#d97706';
    return '#64748b';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
        Demand Matching & Hiring
      </h2>

      {/* Position Selector */}
      <div className="demand-matching">
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
            Available Positions
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {openPositions.map((pos, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPosition(idx)}
                style={{
                  padding: '0.5rem 1rem',
                  border: selectedPosition === idx ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                  background: selectedPosition === idx ? '#eef2ff' : 'white',
                  color: selectedPosition === idx ? '#4f46e5' : '#475569',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 150ms'
                }}
              >
                {pos.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Position Details */}
        <div className="demand-position">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
            <div>
              <div className="position-title">{position.title}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                Salary: <strong>{position.salary}</strong>
              </div>
            </div>
            <span
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: position.priority === 'High' ? '#fee2e2' : '#fef3c7',
                color: position.priority === 'High' ? '#991b1b' : '#92400e',
              }}
            >
              {position.priority} Priority
            </span>
          </div>

          <div className="position-requirements">
            <strong style={{ color: '#0f172a' }}>Required Skills:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {position.requirements.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.8rem',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Matched Candidates */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
            💡 Top Matched Candidates ({matchedCandidates.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {matchedCandidates.length > 0 ? (
              matchedCandidates.map((candidate, idx) => (
                <div key={idx} className="candidate-match">
                  <div className="candidate-info">
                    <div className="candidate-name">{candidate.name}</div>
                    <div className="candidate-skills">
                      {candidate.skills.slice(0, 3).join(', ')}
                      {candidate.skills.length > 3 ? `... +${candidate.skills.length - 3}` : ''}
                    </div>
                  </div>
                  <div className="match-percentage">
                    <div className={`match-circle ${getMatchCircleClass(candidate.matchScore)}`}>
                      {candidate.matchScore}%
                    </div>
                    <div className="match-text">Match Score</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '0.375rem',
                color: '#64748b'
              }}>
                No suitable candidates found for this position
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hiring Analytics */}
      <div className="analytics-box">
        <div className="analytics-title">Hiring Pipeline</div>
        <div className="analytics-grid">
          <div className="analytics-item">
            <div className="analytics-item-label">Open Positions</div>
            <div className="analytics-item-value">{openPositions.length}</div>
          </div>
          <div className="analytics-item">
            <div className="analytics-item-label">Good Matches</div>
            <div className="analytics-item-value" style={{ color: '#16a34a' }}>
              {matchedCandidates.filter(c => c.matchScore >= 70).length}
            </div>
          </div>
          <div className="analytics-item">
            <div className="analytics-item-label">Fill Rate</div>
            <div className="analytics-item-value" style={{ color: '#4f46e5' }}>
              {Math.round((matchedCandidates.length / employees.length) * 100)}%
            </div>
          </div>
          <div className="analytics-item">
            <div className="analytics-item-label">Avg Match</div>
            <div className="analytics-item-value" style={{ color: '#d97706' }}>
              {matchedCandidates.length > 0
                ? Math.round(matchedCandidates.reduce((sum, c) => sum + c.matchScore, 0) / matchedCandidates.length)
                : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
