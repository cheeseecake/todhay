import { API_ROOT } from "../App";

/* The CSRF token is handed to us by /set-csrf and kept in memory, so the
   csrftoken cookie itself can stay HttpOnly. */
let csrfToken = null;

let onUnauthorized = () => {};

export const setUnauthorizedHandler = (handler) => {
    onUnauthorized = handler;
};

/* Allows 4xx/5xx errors to be caught by checking response status */
const fetchWithErrorHandling = (url, args) =>
    fetch(url, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-Csrftoken": csrfToken } : {}),
        },
        ...args,
    }).then(async (r) => {
        if (r.ok)
            // We avoid parsing empty response (aka HTTP 204 No Content)
            // to avoid throwing invalid JSON parse errors
            return r.status !== 204 && r.json();
        if (r.status === 401) {
            onUnauthorized();
        }
        const body = await r.json().catch(() => null);
        throw new Error(
            JSON.stringify(
                body || { status: r.status, statusText: r.statusText },
                undefined,
                2
            )
        );
    });

export const getCSRF = () =>
    fetchWithErrorHandling(`${API_ROOT}/set-csrf`).then((res) => {
        csrfToken = res ? res.csrfToken : null;
        return res;
    });

export const getSession = () => fetchWithErrorHandling(`${API_ROOT}/session`);

export const getLogin = (credentials) =>
    fetchWithErrorHandling(`${API_ROOT}/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
    }).then((session) => {
        // Django rotates the CSRF token on login
        csrfToken = session.csrfToken || csrfToken;
        return session;
    });

export const getLogout = () =>
    fetchWithErrorHandling(`${API_ROOT}/logout`, {
        method: "POST",
    });

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
