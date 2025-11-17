import '../styles.css';

export default function DemandDetailsModal({ demand, onClose }) {
  if (!demand) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content demand-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {demand.role}
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
              ID: {demand.id}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Status and Location badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor:
                  demand.status === 'Open'
                    ? '#dcfce7'
                    : demand.status === 'Allocated'
                    ? '#dbeafe'
                    : demand.status === 'Mapped'
                    ? '#fef3c7'
                    : '#fee2e2',
                color:
                  demand.status === 'Open'
                    ? '#166534'
                    : demand.status === 'Allocated'
                    ? '#164e63'
                    : demand.status === 'Mapped'
                    ? '#92400e'
                    : '#991b1b',
              }}
            >
              {demand.status || 'Unknown Status'}
            </span>
            <span
              style={{
                display: 'inline-block',
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: demand.location === 'Onshore' ? '#dbeafe' : '#dcfce7',
                color: demand.location === 'Onshore' ? '#164e63' : '#166534',
              }}
            >
              {demand.location || 'Unknown Location'}
            </span>
            {demand.revised && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: '#fce7f3',
                  color: '#be185d',
                }}
              >
                Revised
              </span>
            )}
          </div>

          {/* Key Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="detail-field">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Project ID
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                {demand.project_id || 'N/A'}
              </div>
            </div>

            <div className="detail-field">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Account ID
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                {demand.account_id || 'N/A'}
              </div>
            </div>

            <div className="detail-field">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Role Code
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                {demand.roleCode || 'N/A'}
              </div>
            </div>

            <div className="detail-field">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Allocation %
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                {demand.allocationPercentage || 'N/A'}%
              </div>
            </div>

            <div className="detail-field">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Start Date
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                {formatDate(demand.originalStartDate)}
              </div>
            </div>

            <div className="detail-field">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                End Date
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                {formatDate(demand.allocationEndDate)}
              </div>
            </div>

            <div className="detail-field">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Probability
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                {demand.probability || 'N/A'}%
              </div>
            </div>

            <div className="detail-field">
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Billing Rate
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}>
                ${demand.billingRate || 'N/A'}
              </div>
            </div>
          </div>

          {/* Resource Mapped */}
          {demand.resourceMapped && (
            <div className="detail-field" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Resource Mapped
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#0f172a', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px' }}>
                {demand.resourceMapped}
              </div>
            </div>
          )}

          {/* Comments */}
          {demand.comment && (
            <div className="detail-field" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Comments
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#0f172a', padding: '0.75rem', background: '#f1f5f9', borderRadius: '4px', lineHeight: '1.5' }}>
                {demand.comment}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <div>Added by: {demand.addedBy || 'N/A'} on {formatDate(demand.addedOn)}</div>
            <div style={{ marginTop: '0.25rem' }}>Last updated by: {demand.lastUpdatedBy || 'N/A'} on {formatDate(demand.updatedOn)}</div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="button button-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
