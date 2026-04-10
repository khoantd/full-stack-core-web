# Docker image build & push (VPS deploy)

This folder contains `docker buildx` helpers to build **multi-platform** images and push them to your container registry (GHCR, Docker Hub, private registry), so your VPS can `docker pull` and run them.

## Prerequisites

- Docker Engine installed locally
- Buildx available: `docker buildx version`
- Logged into your registry:
  - `docker login ghcr.io`
  - or `docker login docker.io`
  - or `docker login registry.example.com`

## Script

- `./docker-build-push.sh`: builds + pushes **backend** and **frontend** images

## Environment variables

Required:

- **`REGISTRY`**: registry host (e.g. `ghcr.io`, `docker.io`, `registry.example.com`)
- **`NAMESPACE`**: org/user/path inside the registry (e.g. `my-org`, `myuser`, `team/project`)

Optional:

- **`APP_NAME`**: image name prefix (default: `full-stack-core-web`)
- **`TAG`**: image tag (default: git short SHA if available, else `latest`)
- **`PLATFORMS`**: target platforms (default: `linux/amd64`)
  - Use multi-arch: `linux/amd64,linux/arm64`
- **`BUILDER_NAME`**: buildx builder name (default: `coreweb-builder`)

Frontend build-time public env (optional, but recommended for production):

- **`NEXT_PUBLIC_API_URL`**: API base URL baked into the Next.js build (e.g. `https://api.example.com`)
- **`NEXT_PUBLIC_APP_URL`**: site base URL baked into Next.js metadata (e.g. `https://example.com`)

## Output images

Given `REGISTRY`, `NAMESPACE`, `APP_NAME`, `TAG`, the script pushes:

- **Backend**: `REGISTRY/NAMESPACE/APP_NAME-backend:TAG`
- **Frontend**: `REGISTRY/NAMESPACE/APP_NAME-frontend:TAG`

Example:

- `ghcr.io/acme/coreweb-backend:latest`
- `ghcr.io/acme/coreweb-frontend:latest`

## Examples

### GHCR (GitHub Container Registry)

```bash
docker login ghcr.io

REGISTRY=ghcr.io \
NAMESPACE=<github-org-or-user> \
APP_NAME=coreweb \
TAG=latest \
PLATFORMS=linux/amd64 \
NEXT_PUBLIC_API_URL=https://api.example.com \
NEXT_PUBLIC_APP_URL=https://example.com \
./scripts/docker-build-push.sh
```

### Docker Hub

```bash
docker login docker.io

REGISTRY=docker.io \
NAMESPACE=<dockerhub-username-or-org> \
APP_NAME=coreweb \
TAG=latest \
PLATFORMS=linux/amd64 \
NEXT_PUBLIC_API_URL=https://api.example.com \
NEXT_PUBLIC_APP_URL=https://example.com \
./scripts/docker-build-push.sh
```

### Private registry

```bash
docker login registry.example.com

REGISTRY=registry.example.com \
NAMESPACE=team/project \
APP_NAME=coreweb \
TAG=2026-04-10 \
PLATFORMS=linux/amd64,linux/arm64 \
NEXT_PUBLIC_API_URL=https://api.example.com \
NEXT_PUBLIC_APP_URL=https://example.com \
./scripts/docker-build-push.sh
```

## Deploy on VPS (quick sketch)

On the VPS, log in to the same registry and pull the tags you pushed:

```bash
docker login ghcr.io
docker pull ghcr.io/<namespace>/coreweb-backend:latest
docker pull ghcr.io/<namespace>/coreweb-frontend:latest
```

How you run containers (ports, env, MongoDB) depends on your VPS setup (compose vs systemd vs plain `docker run`).

