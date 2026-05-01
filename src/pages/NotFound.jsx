import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="page" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h1 className="font-serif" style={{ fontSize: '4rem', margin: 0 }}>
        404
      </h1>
      <p className="page-sub">The page you are looking for could not be found.</p>
      <Link className="btn btn-primary" to="/">
        Go home
      </Link>
    </div>
  );
}
