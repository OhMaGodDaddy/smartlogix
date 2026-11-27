import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';

const FeedbackContext = createContext();

const TOAST_MS = 5000;

/**
 * Native <dialog>, so the browser traps focus, handles Escape and blocks the page behind it.
 * With `field` set ({ label, options, defaultValue }), confirming returns the chosen option.
 */
const ConfirmDialog = ({ title, message, confirmLabel = 'Confirm', danger = false, field, onClose }) => {
  const dialogRef = useRef(null);
  const [value, setValue] = useState(field ? field.defaultValue ?? field.options[0] : null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal confirm-dialog"
      aria-labelledby="confirm-title"
      onCancel={(e) => { e.preventDefault(); onClose(null); }}
    >
      <div className="modal-header">
        <h3 id="confirm-title" className="modal-title">{title}</h3>
      </div>
      <div className="modal-body">
        <p style={{ fontSize: '0.9rem' }}>{message}</p>
        {field && (
          <label className="form-group" style={{ display: 'block', margin: '1rem 0 0' }}>
            <span className="form-label">{field.label}</span>
            <select className="form-control" value={value} onChange={(e) => setValue(e.target.value)}>
              {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="modal-footer">
        {/* Cancel takes focus first, so pressing Enter by habit changes nothing. */}
        <button type="button" autoFocus onClick={() => onClose(null)} className="btn btn-secondary">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onClose(field ? value : true)}
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
};

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [request, setRequest] = useState(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  /** Shows a short message. Errors stay until dismissed so they can't be missed. */
  const notify = useCallback((message, type = 'success') => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((list) => [...list, { id, message, type }]);
    if (type !== 'error') setTimeout(() => dismiss(id), TOAST_MS);
  }, [dismiss]);

  /** Resolves with null if cancelled, otherwise true or the chosen field value. */
  const confirm = useCallback(
    (options) => new Promise((resolve) => setRequest({ ...options, resolve })),
    []
  );

  const closeDialog = (result) => {
    request.resolve(result);
    setRequest(null);
  };

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {request && <ConfirmDialog {...request} onClose={closeDialog} />}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : undefined}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss message">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);
