import { useState } from 'react';
import '../styles.css';

export default function AISearchBar({ onSearch, isLoading }) {
  const [taskDescription, setTaskDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [useSqlAgent, setUseSqlAgent] = useState(true);
  const [target, setTarget] = useState('demands');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (taskDescription.trim() === '') {
      alert('Please enter a task description');
      return;
    }
    setSubmitted(true);
    await onSearch(taskDescription, useSqlAgent, target);
  };

  const handleReset = () => {
    setTaskDescription('');
    setSubmitted(false);
    onSearch('');
  };

  return (
    <div className="search-bar">
      <h2 className="search-title">
        Find Demands
      </h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label className="form-label">
            {/* Describe your task or project requirements */}
          </label>
          <textarea
            placeholder="e.g., Ux developer with TypeScript and modern UI experience..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            disabled={isLoading}
            className="form-textarea"
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            disabled={isLoading}
            className="button submitbutton"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="button submitbutton"
          >
            Clear
          </button>
        </div>

        {/* <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input id="use-sql" type="checkbox" checked={useSqlAgent} onChange={(e) => setUseSqlAgent(e.target.checked)} />
          <label htmlFor="use-sql" style={{ fontSize: '0.875rem', color: '#475569' }}>Use SQL agent (generate & execute SQL)</label>
        </div> */}

        {/* <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="search-target" style={{ fontSize: '0.875rem', color: '#475569' }}>Search target:</label>
          <select id="search-target" value={target} onChange={(e) => setTarget(e.target.value)} disabled={isLoading} className="form-select">
            <option value="employees">Employees</option>
            <option value="demands">Demands</option>
          </select>
        </div> */}

        {/* {submitted && (
          <div className="search-examples">
            <p className="search-examples-title">Example searches:</p>
            <ul className="search-examples-list">
              {exampleTasks.map((task, idx) => (
                <li key={idx} className="search-examples-item">
                  • {task}
                </li>
              ))}
            </ul>
          </div>
        )} */}
      </form>
    </div>
  );
}
