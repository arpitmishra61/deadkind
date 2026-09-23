async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = body?.error || `Request to ${path} failed with status ${res.status}.`;
    throw new Error(message);
  }

  return body;
}

export function apiGet(path) {
  return request(path, { method: "GET" });
}

export function apiPost(path, data) {
  return request(path, { method: "POST", body: JSON.stringify(data) });
}
