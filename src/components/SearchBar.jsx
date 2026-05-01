export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <input
      className="input"
      style={{ maxWidth: 280 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
