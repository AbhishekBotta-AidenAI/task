import { useState, useMemo } from "react";
import "../styles.css";

/* Utility to compute date difference in days */
const dateDiff = (d1, d2) =>
  Math.ceil((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));

export default function ProjectsDashboard({ projects }) {
  const [sortOption, setSortOption] = useState("deadline");

  const getDeadlineAlert = (deadline) => {
    const today = new Date();
    const daysLeft = dateDiff(today, deadline);

    if (daysLeft <= 0) return { class: "deadline-alert-urgent", text: "OVERDUE" };
    if (daysLeft <= 3) return { class: "deadline-alert-urgent", text: `${daysLeft} DAYS LEFT` };
    if (daysLeft <= 7) return { class: "deadline-alert-warning", text: `${daysLeft} DAYS LEFT` };
    return { class: "deadline-alert-safe", text: `${daysLeft} DAYS LEFT` };
  };

  /** ---------------------------
   *  SORTING LOGIC
   * --------------------------*/
  const sortedProjects = useMemo(() => {
    let result = [...projects];

    switch (sortOption) {
      case "progress":
        result.sort((a, b) => b.progress - a.progress);
        break;
      case "deadline":
        result.sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline)
        );
        break;
      case "budget":
        result.sort((a, b) => b.budget - a.budget);
        break;
      case "team":
        result.sort((a, b) => b.teamMembers.length - a.teamMembers.length);
        break;
      default:
        break;
    }

    return result;
  }, [sortOption, projects]);

  /** ---------------------------
   *  GANTT CHART DATA PROCESSING
   * --------------------------*/
  const ganttData = useMemo(() => {
    return sortedProjects.map((proj) => {
      const startDate = new Date(proj.deadline);
      startDate.setDate(startDate.getDate() - proj.duration * 7); // duration in weeks

      const endDate = new Date(proj.deadline);

      return {
        name: proj.name,
        start: startDate,
        end: endDate,
        duration: proj.duration,
        progress: proj.progress,
      };
    });
  }, [sortedProjects]);

  /** For Gantt Scaling */
  const minStart = new Date(Math.min(...ganttData.map((g) => g.start)));
  const maxEnd = new Date(Math.max(...ganttData.map((g) => g.end)));
  const totalDays = dateDiff(minStart, maxEnd);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Sorting Dropdown */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "0.5rem"
      }}>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: "1px solid #cbd5e1",
            fontWeight: 600
          }}
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="progress">Sort by Progress</option>
          <option value="budget">Sort by Budget</option>
          <option value="team">Sort by Team Size</option>
        </select>
      </div>

      {/* Gantt Chart */}
      <div className="analytics-box">
        <div className="analytics-title">Project Timeline (Gantt Chart)</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {ganttData.map((g, idx) => {
            const barStart = (dateDiff(minStart, g.start) / totalDays) * 100;
            const barWidth = (dateDiff(g.start, g.end) / totalDays) * 100;

            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  {g.name}
                </div>

                <div style={{
                  height: "12px",
                  background: "#e2e8f0",
                  borderRadius: "6px",
                  position: "relative"
                }}>
                  <div
                    style={{
                      position: "absolute",
                      left: `${barStart}%`,
                      width: `${barWidth}%`,
                      height: "100%",
                      borderRadius: "6px",
                      background: "linear-gradient(90deg,#3b82f6,#06b6d4)"
                    }}
                  ></div>

                  <div
                    style={{
                      position: "absolute",
                      left: `${barStart}%`,
                      width: `${(barWidth * g.progress) / 100}%`,
                      height: "100%",
                      borderRadius: "6px",
                      background: "rgba(16,185,129,0.9)"
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Cards */}
      <div>
        <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem" }}>
          Projects Overview
        </h2>

        <div className="projects-grid">
          {sortedProjects.map((project, idx) => {
            const deadlineInfo = getDeadlineAlert(project.deadline);

            return (
              <div key={idx} className="project-card">
                <div className="project-card-header">
                  <div className="project-card-title">{project.name}</div>
                  <div className="project-card-status">{project.status}</div>
                </div>

                <div className="project-card-body">

                  <div className="card-row">
                    <span className="card-label">Budget:</span>
                    <span className="card-value">${project.budget}K</span>
                  </div>

                  <div className="card-row">
                    <span className="card-label">Timeline:</span>
                    <span className="card-value">{project.duration} weeks</span>
                  </div>

                  <div className="progress-container">
                    <div className="progress-label">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-track-fill"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        marginBottom: "0.5rem"
                      }}
                    >
                      Team Members ({project.teamMembers.length})
                    </div>

                    <div className="team-members">
                      {project.teamMembers.map((member, i) => (
                        <div key={i} className="member-avatar" title={member.name}>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`deadline-alert ${deadlineInfo.class}`}>
                    📅 {deadlineInfo.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
