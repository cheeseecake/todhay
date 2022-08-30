# Chanel Backend for Web App

Each folder here corresponds to one container - i.e. `backend` is your web app backend, and `nginx` is the HTTP server routing requests to each container.

To add more containers, modify the `docker-compose.yml` file, then add the routing details into the `nginx/nginx.conf` file, and finally do `docker compose up -d` to start the new containers up.

# Todo/Habit Incentive Webapp

## Getting Started

- Install Docker
- Clone this repo (or `git pull` if you've already cloned it)
- Install `npm` packages for the frontend locally:
  - Ensure you have the latest version of `npm` available on your system
  - `cd frontend`
  - `npm ci`
- Make and execute Django migrations:
  - `cd backend`
  - `python manage.py makemigrations`
  - `python manage.py migrate`
- Build docker-compose images:
  - `docker compose build`
- Run:
  - `docker compose up`
  - View the app at [localhost:10000](http://localhost:10000)

## Notes

- The DB (`db.sqlite3`) will be persisted across container restarts/deletes.
- After changing any code, you'll need to rebuild and re-run the `docker compose` commands to see the effect.
- If you installed new Python packages, you'll need to rebuild the container: `docker compose build` followed by `docker compose up --force-recreate`
- If you install new `npm` packages, rerun `npm i` from the `frontend/` directory.
- If you get the error `Error response from daemon: Ports are not available: listen tcp 0.0.0.0:10001: bind: An attempt was made to access a socket in a way forbidden by its access permissions.`:
  - Stop the docker containers: `docker compose down`
  - Open `cmd` as Administrator
  - `net stop winnat`
  - `net start winnat`
  - Restart the docker containers: `docker compose up`
- If you get `OCI runtime create failed` errors, make sure you've run `npm i` in the `./frontend` folder, and re-run Docker with `docker compose up --force-recreate`.

## Updating dependencies

- Backend: Run `pip list --outdated`, then modify `requirements.txt` accordingly
- Frontend: Run `npm outdated`, then `npm update` to update *non-breaking* packages, followed by `npm i <package-name>` to update potentially breaking packages
- Remember to check and fix breaking issues!

## Issues

See Issues