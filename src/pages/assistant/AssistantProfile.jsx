import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { CLINIC } from '../../data/initialState';

export function AssistantProfile() {
  const { user } = useAuth();
  const { state } = useAppData();
  const a = state.assistants.find((x) => x.id === user.id);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h1 className="page-title font-serif" style={{ marginTop: 0 }}>
          Staff profile
        </h1>
        <p>
          <strong>Name:</strong> {a?.fullName}
        </p>
        <p>
          <strong>Role:</strong> {a?.role}
        </p>
        <p>
          <strong>Email:</strong> {a?.email}
        </p>
        <p>
          <strong>Phone:</strong> {a?.phone}
        </p>
        <p>
          <strong>Assigned functions:</strong> {a?.assignedFunctions?.join(', ')}
        </p>
      </div>
      <div className="card">
        <h2 className="card-title">Clinic contact</h2>
        <p>{CLINIC.name}</p>
        <p>{CLINIC.owner}</p>
        <p className="muted">{CLINIC.address}</p>
        <p>{CLINIC.phones[0]}</p>
        <p>{CLINIC.phones[1]}</p>
      </div>
    </div>
  );
}
