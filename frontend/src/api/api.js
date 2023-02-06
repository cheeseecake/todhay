import { API_ROOT } from "../App";

/* Allows 4xx/5xx errors to be caught by checking response status */
function getCookie(name) {
  if (!document.cookie) {
    return null;
  }
  const xsrfCookies = document.cookie
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c.startsWith(name + "="));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split("=")[1]);
}

const fetchWithErrorHandling = (url, args) =>
  fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Csrftoken": getCookie("csrftoken"),
    },
    ...args,
  }).then(async (r) => {
    if (r.ok)
      // We avoid parsing empty response (aka HTTP 204 No Content)
      // to avoid throwing invalid JSON parse errors
      return r.status !== 204 && r.json();
    else {
      // const html = await r.text()
      // throw new Error(html)
      const json = await r.json();
      throw new Error(JSON.stringify(json, undefined, 2));
    }
  });
export const getCSRF = () => fetchWithErrorHandling(`${API_ROOT}/set-csrf`);

export const getLogin = (credentials) =>
  fetchWithErrorHandling(`${API_ROOT}/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const getLogout = () => fetchWithErrorHandling(`${API_ROOT}/logout`);

export const getType = (type, queryparams = "") =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}${queryparams}`);

export const createType = (item, type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}`, {
    method: "POST",
    body: JSON.stringify(item),
  });

export const updateType = (item, type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}/${item.id}`, {
    method: "PUT",
    body: JSON.stringify(item),
  });

export const patchType = (item, type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}/${item.id}`, {
    method: "PATCH",
    body: JSON.stringify(item),
  });

export const deleteType = (item, type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}/${item.id}`, {
    method: "DELETE",
  });
