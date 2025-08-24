export async function fetchJSONWithErrors(
  input: RequestInfo,
  init?: RequestInit
) {
  const resp = await fetch(input, init);
  let payload: any = null;
  try {
    payload = await resp.json();
  } catch {
    // non-JSON error bodies still possible
  }
  if (!resp.ok) {
    const msg =
      payload?.error ||
      payload?.message ||
      (typeof payload === 'string' ? payload : '') ||
      `Request failed (${resp.status})`;
    const detail = payload?.detail
      ? typeof payload.detail === 'string'
        ? payload.detail
        : JSON.stringify(payload.detail)
      : '';
    throw new Error(detail ? `${msg}: ${detail}` : msg);
  }
  return payload;
}
