import React from 'react';

export default function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">🚪</div>
        <h3>Logout Confirmation</h3>
        <p>Are you sure you want to logout from the Attendance Management System?</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Logout</button>
        </div>
      </div>
    </div>
  );
}
