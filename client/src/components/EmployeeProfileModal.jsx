import '../styles.css';

export default function EmployeeProfileModal({ employee, projects, onClose }) {
  if (!employee) return null;

  // Mock projects for this employee
  const employeeProjects = projects.filter(p => 
    p.teamMembers.some(member => member.name === employee.name)
  );

  // Generate calendar for next 30 days
  const generateCalendar = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      
      let status = 'available';
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'unavailable'; // Weekends
      } else if (Math.random() > 0.7) {
        status = 'partial';
      }
      
      days.push({
        date: date.getDate(),
        status,
      });
    }
    return days;
  };

  const calendarDays = generateCalendar();

  const getAvailabilityDot = () => {
    switch (employee.availability) {
      case 'Available':
        return 'availability-dot availability-dot-available';
      case 'Partially Available':
        return 'availability-dot availability-dot-partial';
      case 'Not Available':
        return 'availability-dot availability-dot-unavailable';
      default:
        return 'availability-dot';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{employee.name}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Header Info */}
          <div className="profile-section">
            <div className="employee-meta">
              <div className="employee-meta-item">
                <div className={getAvailabilityDot()}></div>
                <span>{employee.availability}</span>
              </div>
              <div className="employee-meta-item">
                <span className="employee-team">{employee.team}</span>
              </div>
              <div className="employee-meta-item">
                <span>Strength: <strong style={{ color: '#4f46e5' }}>{employee.strength}%</strong></span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="profile-section">
            <div className="profile-section-title">Skills & Expertise</div>
            <div className="skills-list">
              {employee.skills.map((skill, idx) => (
                <div key={idx} className="skill-badge">
                  {skill}
                  <span className="proficiency-level">Expert</span>
                </div>
              ))}
            </div>
          </div>

          {/* Qualifications */}
          <div className="profile-section">
            <div className="profile-section-title">Qualifications</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {employee.qualifications.map((qual, idx) => (
                <div key={idx} style={{
                  background: '#eef2ff',
                  color: '#4f46e5',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  {qual}
                </div>
              ))}
            </div>
          </div>

          {/* Current Projects */}
          {employeeProjects.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">Current Projects</div>
              <div className="projects-list">
                {employeeProjects.map((project, idx) => (
                  <div key={idx} className="project-item">
                    <div className="project-name">{project.name}</div>
                    <div className="project-progress">
                      <div className="project-bar">
                        <div className="project-fill" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <span>{project.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="profile-section">
            <div className="profile-section-title">Performance Metrics</div>
            <div className="analytics-grid">
              <div className="analytics-item">
                <div className="analytics-item-label">Assigned Tasks</div>
                <div className="analytics-item-value">{employeeProjects.length * 3}</div>
              </div>
              <div className="analytics-item">
                <div className="analytics-item-label">Completed</div>
                <div className="analytics-item-value">{Math.floor(employeeProjects.length * 2.5)}</div>
              </div>
              <div className="analytics-item">
                <div className="analytics-item-label">Pending</div>
                <div className="analytics-item-value">{Math.floor(employeeProjects.length * 0.5)}</div>
              </div>
            </div>
          </div>

          {/* Availability Calendar */}
          <div className="profile-section">
            <div className="profile-section-title">Availability (Next 30 Days)</div>
            <div className="availability-calendar">
              <div className="calendar-grid">
                {calendarDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`calendar-day calendar-day-${day.status}`}
                    title={`Day ${day.date}`}
                  >
                    {day.date}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '0.125rem', background: '#dcfce7' }}></div>
                Available
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '0.125rem', background: '#fef3c7' }}></div>
                Partial
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '0.125rem', background: '#fee2e2' }}></div>
                Unavailable
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
