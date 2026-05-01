let seq = 100;

export function nextId(prefix) {
  seq += 1;
  return `${prefix}-${seq}`;
}
