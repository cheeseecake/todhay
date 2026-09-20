# Todhay

Todo/habit incentive web app.

- `frontend/` — React (Create React App) single-page app, deployed as static files
- `backend/` — Django + Django REST Framework API with a SQLite database

## Architecture

| Piece | Where | URL |
| --- | --- | --- |
| Frontend | GitHub Pages | https://todhay.chanelng.com |
| Backend | Server, Docker + Traefik | https://api.todhay.chanelng.com |

GitHub Actions does both deployments:

- `.github/workflows/frontend-pages.yml` builds `frontend/` and publishes it to
  GitHub Pages
- `.github/workflows/backend-image.yml` builds `backend/Dockerfile` and pushes
  `ghcr.io/cheeseecake/todhay-backend` to GHCR

## Initial Setup (one-time)

Ensure [Devenv] is installed.

Generate the base Devenv configuration:

```sh
devenv init
```

In `devenv.nix`, enable Python, uv, pnpm and any other packages you want:

```nix
# https://devenv.sh/languages/
languages.python = {
  enable = true;
  version = "3.12";
  uv.enable = true;
};
languages.javascript.enable = true;
languages.javascript.pnpm.enable = true;
```

Add the `nixpkgs-python` repository to sources at `devenv.yaml`:

```sh
devenv inputs add nixpkgs-python github:cachix/nixpkgs-python --follows nixpkgs
```

Enter the development shell:

```sh
devenv shell
```

Start the backend:

```sh
cd backend
uv run manage.py migrate
uv run manage.py runserver
```

Start the frontend:

```sh
cd frontend
pnpm start
```

You can view the frontend at `http://localhost:3000` and the backend at
`http://localhost:8000`. The frontend defaults to `http://localhost:8000` for
the API; set `REACT_APP_API_ROOT` to override it.

### Editor Integration

The default Python interpreter needs to be selected in VSCode initially.

You can set it up by clicking 'Select Interpreter' in the lower right corner of
the screen (make sure you click on a `.py` file first).

The interpreter is located at `.devenv/state/venv/bin/python`.

## Authentication

The API requires an authenticated session; there is a single user account
created with `manage.py createsuperuser`. The frontend uses Django's session
cookie plus CSRF:

1. `GET /set-csrf` returns a CSRF token (kept in memory) and sets the
   `csrftoken` cookie.
2. `POST /login` with the token in the `X-Csrftoken` header starts a session.
   Login attempts are rate limited.
3. All API requests are sent with `credentials: "include"`; DRF's
   `SessionAuthentication` requires a valid session and enforces CSRF on unsafe
   requests.
4. `GET /session` tells the frontend whether it is already logged in, and
   `POST /logout` ends the session.

Because `todhay.chanelng.com` and `api.todhay.chanelng.com` share the same
registrable domain, the cookies are first-party and work in all browsers.

## Deployment

### Frontend (GitHub Pages)

DNS: add a `CNAME` record for `todhay.chanelng.com` pointing to
`cheeseecake.github.io` (DNS-only, no proxy).

Repository settings → Pages:

- Source: GitHub Actions
- Custom domain: `todhay.chanelng.com` (also committed as `frontend/public/CNAME`)
- Enforce HTTPS: enabled

The API URL is baked into the build through `REACT_APP_API_ROOT` in
`.github/workflows/frontend-pages.yml`.

### Backend (server)

The image is published to GHCR on pushes touching `backend/**`. GitHub packages
are private by default: either make the package public in its settings, or log
in to GHCR on the server first:

```sh
docker login ghcr.io -u cheeseecake -p <PAT with read:packages>
```

On the server, from this repository:

```sh
mkdir -p data
cp backend.env.example backend.env   # then fill in SECRET_KEY, etc.
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Notes:

- `docker-compose.prod.yml` expects an external Traefik network named `traefik`
  and a certificate resolver named `letsencrypt`. Adjust the labels and network
  to match your Traefik setup.
- `./data` holds the SQLite database and must be writable by uid 1000
  (`chown 1000:1000 data`). To keep existing data, copy the old `db.sqlite3`
  to `./data/db.sqlite3` before starting.
- Migrations and `collectstatic` run automatically on container start.
- Create the account once:

```sh
docker compose -f docker-compose.prod.yml exec backend uv run manage.py createsuperuser
```

- Generate a `SECRET_KEY` for `backend.env` with:

```sh
openssl rand -base64 64
```

[Devenv]: https://devenv.sh/getting-started/
