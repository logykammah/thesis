import { useCallback, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { todayISODate } from '../../utils/format';
import { isLikelyImageFile, SMILE_PREVIEW_PROCEDURES } from '../../utils/smilePreviewCanvas';

const DISCLAIMER =
  'This is an AI-generated visual preview for consultation purposes only and does not represent a final clinical result.';

const MAX_BYTES = 8 * 1024 * 1024;
const DEMO_AFTER_URL = '/demp-after.jpeg';
const DEMO_AFTER_NAME = 'demp-after.jpeg';

export function AiSmilePreviewPanel() {
  const { user } = useAuth();
  const { state, saveSmilePreview, pushToast } = useAppData();
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const afterFileRef = useRef(null);

  const [patientId, setPatientId] = useState('');
  const [beforeUrl, setBeforeUrl] = useState('');
  /** Original file when available — browsers decode this more reliably than some data URLs (e.g. HEIC). */
  const [sourceFile, setSourceFile] = useState(null);
  /** AI / simulated preview */
  const [afterUrl, setAfterUrl] = useState('');
  /** Optional second upload: your own “after” photo (e.g. stock result or lab mock-up). */
  const [afterManualUrl, setAfterManualUrl] = useState('');
  const [afterManualName, setAfterManualName] = useState('');
  const [procedure, setProcedure] = useState(SMILE_PREVIEW_PROCEDURES[0]);
  const [fileName, setFileName] = useState('');

  const displayAfter = afterUrl || afterManualUrl;

  const linkedPatientIds = useMemo(() => {
    const ids = new Set();
    state.visits.filter((v) => v.dentistId === user.id).forEach((v) => ids.add(v.patientId));
    state.treatmentRecords.filter((t) => t.dentistId === user.id).forEach((t) => ids.add(t.patientId));
    state.appointments.filter((a) => a.dentistId === user.id).forEach((a) => ids.add(a.patientId));
    return ids;
  }, [state, user.id]);

  const patientOptions = useMemo(() => {
    return state.patients.filter((p) => linkedPatientIds.has(p.id)).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [state.patients, linkedPatientIds]);

  const ingestFile = useCallback(
    (file) => {
      if (!file) return;
      if (!isLikelyImageFile(file)) {
        pushToast('Please choose an image file (JPEG, PNG, WebP, etc.).', 'error');
        return;
      }
      if (file.size > MAX_BYTES) {
        pushToast('Image must be 8 MB or smaller.', 'error');
        return;
      }
      setSourceFile(file);
      setAfterUrl('');
      setAfterManualUrl('');
      setAfterManualName('');
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : '';
        setBeforeUrl(url);
        setAfterManualUrl(DEMO_AFTER_URL);
        setAfterManualName(DEMO_AFTER_NAME);
        setAfterUrl('');
      };
      reader.onerror = () => {
        setSourceFile(null);
        pushToast('Could not read the image file.', 'error');
      };
      reader.readAsDataURL(file);
    },
    [pushToast],
  );

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    ingestFile(f);
    e.target.value = '';
  };

  const ingestAfterFile = useCallback(
    (file) => {
      if (!file) return;
      if (!beforeUrl) {
        pushToast('Upload the “before” smile photo first.', 'error');
        return;
      }
      if (!isLikelyImageFile(file)) {
        pushToast('Please choose an image file for the after photo.', 'error');
        return;
      }
      if (file.size > MAX_BYTES) {
        pushToast('After image must be 8 MB or smaller.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : '';
        setAfterManualUrl(url);
        setAfterManualName(file.name);
        setAfterUrl('');
        pushToast('After image added. It will show beside your before photo.');
      };
      reader.onerror = () => pushToast('Could not read the after image.', 'error');
      reader.readAsDataURL(file);
    },
    [beforeUrl, pushToast],
  );

  const onAfterFileChange = (e) => {
    const f = e.target.files?.[0];
    ingestAfterFile(f);
    e.target.value = '';
  };

  const clearManualAfter = () => {
    setAfterManualUrl('');
    setAfterManualName('');
  };

  const generate = async () => {
    if (!beforeUrl && !sourceFile) {
      pushToast('Upload a smile photo first.', 'error');
      return;
    }
    setAfterUrl('');
    setAfterManualUrl(DEMO_AFTER_URL);
    setAfterManualName(DEMO_AFTER_NAME);
    pushToast('Preview image applied.');
  };

  const save = () => {
    if (!patientId) {
      pushToast('Select a patient to attach this preview.', 'error');
      return;
    }
    if (!beforeUrl || !displayAfter) {
      pushToast('Add an after preview (upload an after image or generate with AI) before saving.', 'error');
      return;
    }
    saveSmilePreview({
      patientId,
      dentistId: user.id,
      procedure,
      beforeDataUrl: beforeUrl,
      afterDataUrl: displayAfter,
      createdDate: todayISODate(),
      disclaimer: DISCLAIMER,
    });
  };

  return (
    <div className="ai-smile-preview card">
      <h2 className="card-title">AI smile preview</h2>
      <p className="muted ai-smile-preview__intro">
        Upload a <strong>before</strong> smile photo, then either <strong>upload your own after image</strong> (ideal smile,
        lab mock-up, etc.) or use <strong>Generate</strong> for an on-device preview. Saved pairs appear on the patient
        profile for consultation only — not a diagnosis or guaranteed outcome.
      </p>

      <div className="ai-smile-preview__toolbar">
        <label className="form-row ai-smile-preview__field">
          Patient
          <select className="select" value={patientId} onChange={(e) => setPatientId(e.target.value)} disabled={patientOptions.length === 0}>
            <option value="">{patientOptions.length === 0 ? 'No linked patients yet' : 'Select patient…'}</option>
            {patientOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} · {p.id}
              </option>
            ))}
          </select>
        </label>

        <label className="form-row ai-smile-preview__field">
          Procedure
          <select className="select" value={procedure} onChange={(e) => setProcedure(e.target.value)}>
            {SMILE_PREVIEW_PROCEDURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="ai-smile-preview__actions">
        <input ref={fileRef} type="file" accept="image/*" className="visually-hidden" onChange={onFileChange} />
        <input ref={camRef} type="file" accept="image/*" capture="user" className="visually-hidden" onChange={onFileChange} />
        <input ref={afterFileRef} type="file" accept="image/*" className="visually-hidden" onChange={onAfterFileChange} />
        <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          Upload smile photo
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => camRef.current?.click()}>
          Capture photo
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => afterFileRef.current?.click()} disabled={!beforeUrl}>
          Upload after image
        </button>
        <button type="button" className="btn btn-primary" onClick={generate} disabled={!beforeUrl && !sourceFile}>
          Apply preview image
        </button>
        <button type="button" className="btn btn-secondary" onClick={save} disabled={!displayAfter || !patientId}>
          Save preview to patient profile
        </button>
      </div>

      {fileName ? (
        <p className="muted ai-smile-preview__filename" style={{ fontSize: '0.85rem' }}>
          Before: {fileName}
          {afterManualName ? (
            <>
              {' · '}
              After (uploaded): {afterManualName}
            </>
          ) : null}
        </p>
      ) : null}

      {afterManualName && !fileName ? (
        <p className="muted ai-smile-preview__filename" style={{ fontSize: '0.85rem' }}>
          After (uploaded): {afterManualName}
        </p>
      ) : null}

      {afterManualUrl ? (
        <p className="ai-smile-preview__manual-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearManualAfter}>
            Remove uploaded after image
          </button>
        </p>
      ) : null}

      {beforeUrl || displayAfter ? (
        <div className="ai-smile-preview__compare">
          <div className="ai-smile-preview__pane">
            <span className="ai-smile-preview__label">Before</span>
            {beforeUrl ? <img src={beforeUrl} alt="Original smile" className="ai-smile-preview__img" /> : <div className="ai-smile-preview__placeholder">No image</div>}
          </div>
          <div className="ai-smile-preview__pane">
            <span className="ai-smile-preview__label">{afterManualUrl && !afterUrl ? 'After (preview image)' : 'After (preview)'}</span>
            {displayAfter ? (
              <img src={displayAfter} alt="After smile preview" className="ai-smile-preview__img" />
            ) : (
              <div className="ai-smile-preview__placeholder">
                Upload a before image to auto-apply the saved preview image
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="ai-smile-preview__placeholder ai-smile-preview__placeholder--wide">Upload a smile photo to begin.</div>
      )}

      <p className="ai-smile-preview__disclaimer">{DISCLAIMER}</p>
    </div>
  );
}
