import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { CLINIC } from '../../data/initialState';
import { AiSmilePreviewPanel } from '../../components/dentist/AiSmilePreviewPanel';

export function DentistProfile() {
  const { user } = useAuth();
  const { state } = useAppData();
  const d = state.dentists.find((x) => x.id === user.id);

  return (
    <div className="dentist-profile-page">
      <AiSmilePreviewPanel />

      <div className="grid grid-2 mt-md">
        <div className="card">
          <h1 className="page-title font-serif" style={{ marginTop: 0 }}>
            Clinician profile
          </h1>
          <p>
            <strong>Name:</strong> {d?.fullName}
          </p>
          <p>
            <strong>Specialty:</strong> {d?.specialty}
          </p>
          <p>
            <strong>Email:</strong> {d?.email}
          </p>
          <p>
            <strong>Phone:</strong> {d?.phone}
          </p>
          <p>
            <strong>Schedule:</strong> {d?.scheduleSummary}
          </p>
        </div>
        <div className="card">
          <h2 className="card-title">Affiliated clinic</h2>
          <p>{CLINIC.name}</p>
          <p className="muted">{CLINIC.address}</p>
          <p>Owner: {CLINIC.owner}</p>
          <p>Phone: {CLINIC.phones[0]}</p>
        </div>
      </div>
    </div>
  );
}
