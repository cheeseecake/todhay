# Chanel Backend for Web App

Each folder here corresponds to one container - i.e. `backend` is your web app backend, and `nginx` is the HTTP server routing requests to each container.

To add more containers, modify the `docker-compose.yml` file, then add the routing details into the `nginx/nginx.conf` file, and finally do `docker compose up -d` to start the new containers up.

# Todo/Habit Incentive Webapp

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

### Editor Integration

The default Python interpreter needs to be selected in VSCode initially.

You can set it up by clicking 'Select Interpreter' in the lower right corner of the screen (make sure you click on a `.py` file first).

The interpreter is located at `.devenv/state/venv/bin/python`.

## Backend

- Make and execute Django migrations:
  - `cd backend`
  - `python manage.py makemigrations`
  - `python manage.py migrate`

[Devenv]: https://devenv.sh/getting-started/
