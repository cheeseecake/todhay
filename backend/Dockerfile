FROM python:3.12-slim-trixie
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV PYTHONUNBUFFERED=1

# Create a non-root user and set cache to writable location
ENV UV_CACHE_DIR=/home/user/.cache/uv
ENV CACHE_UID=1000
ENV CACHE_GID=1000

RUN useradd -ms /bin/bash --user-group -l -u "${CACHE_UID}" user && \
    mkdir -p /data /backend/staticfiles && \
    chown -R user:user /data /backend
USER user
WORKDIR /backend

# Copy and install with proper cache mounts
COPY --chown=user:user pyproject.toml uv.lock /backend/
RUN --mount=type=cache,target=$UV_CACHE_DIR,uid=$CACHE_UID,gid=$CACHE_GID \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Copy the rest of the code
COPY --chown=user:user . .

EXPOSE 8000
CMD ["sh", "-c", "uv run manage.py migrate --noinput && uv run manage.py collectstatic --noinput && exec uv run gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-2}"]