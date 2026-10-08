/** Round a temperature for display; avoids `-0`. */
export function roundTemp(value: number): number {
  const r = Math.round(value);
  return Object.is(r, -0) ? 0 : r;
}
