#!/usr/bin/env bash
set -euo pipefail

# Builds and pushes multi-platform images for VPS deployments.
# Requires: Docker Engine + docker buildx, and `docker login` to your registry.

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

PLATFORMS="${PLATFORMS:-linux/amd64}"
BUILDER_NAME="${BUILDER_NAME:-coreweb-builder}"

# Examples:
# - REGISTRY=ghcr.io NAMESPACE=my-org APP_NAME=coreweb TAG=2026-04-10 ./scripts/docker-build-push.sh
# - REGISTRY=docker.io NAMESPACE=myuser APP_NAME=coreweb TAG=latest ./scripts/docker-build-push.sh
REGISTRY="${REGISTRY:-}"
NAMESPACE="${NAMESPACE:-}"
APP_NAME="${APP_NAME:-full-stack-core-web}"
TAG="${TAG:-}"

# Frontend build-time public env (optional but recommended for prod)
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-}"

usage() {
  cat <<'EOF'
Usage:
  REGISTRY=... NAMESPACE=... [APP_NAME=...] [TAG=...] [PLATFORMS=...] ./scripts/docker-build-push.sh

Required env:
  REGISTRY   Example: ghcr.io | docker.io | registry.example.com
  NAMESPACE  Example: my-org | myuser | team/project

Optional env:
  APP_NAME    Default: full-stack-core-web
  TAG         Default: git sha (if available) else "latest"
  PLATFORMS   Default: linux/amd64 (set to "linux/amd64,linux/arm64" for multi-arch)
  BUILDER_NAME Default: coreweb-builder

Frontend build-time env (optional, but Next.js bakes NEXT_PUBLIC_* into the build):
  NEXT_PUBLIC_API_URL  Example: https://api.example.com
  NEXT_PUBLIC_APP_URL  Example: https://example.com

Images pushed:
  $REGISTRY/$NAMESPACE/$APP_NAME-backend:$TAG
  $REGISTRY/$NAMESPACE/$APP_NAME-frontend:$TAG

Notes:
  - Run `docker login $REGISTRY` first.
  - This script uses `docker buildx build --push` (no local image output).
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ -z "$REGISTRY" || -z "$NAMESPACE" ]]; then
  echo "Error: REGISTRY and NAMESPACE are required."
  echo
  usage
  exit 1
fi

if [[ -z "$TAG" ]]; then
  if command -v git >/dev/null 2>&1 && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    TAG="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
  else
    TAG="latest"
  fi
fi

BACKEND_IMAGE="${REGISTRY}/${NAMESPACE}/${APP_NAME}-backend:${TAG}"
FRONTEND_IMAGE="${REGISTRY}/${NAMESPACE}/${APP_NAME}-frontend:${TAG}"

ensure_builder() {
  if ! docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
    docker buildx create --name "$BUILDER_NAME" --driver docker-container >/dev/null
  fi
  docker buildx use "$BUILDER_NAME" >/dev/null
  docker buildx inspect --bootstrap >/dev/null
}

echo "Using builder: $BUILDER_NAME"
ensure_builder

echo "Building + pushing backend: $BACKEND_IMAGE"
docker buildx build \
  --platform "$PLATFORMS" \
  --pull \
  --push \
  -t "$BACKEND_IMAGE" \
  "$ROOT_DIR/apps/backend"

echo "Building + pushing frontend: $FRONTEND_IMAGE"
FRONTEND_BUILD_ARGS=()
if [[ -n "$NEXT_PUBLIC_API_URL" ]]; then
  FRONTEND_BUILD_ARGS+=(--build-arg "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL")
fi
if [[ -n "$NEXT_PUBLIC_APP_URL" ]]; then
  FRONTEND_BUILD_ARGS+=(--build-arg "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL")
fi

docker buildx build \
  --platform "$PLATFORMS" \
  --pull \
  --push \
  -t "$FRONTEND_IMAGE" \
  "${FRONTEND_BUILD_ARGS[@]}" \
  "$ROOT_DIR/apps/frontend"

echo "Done."
echo "Backend image:  $BACKEND_IMAGE"
echo "Frontend image: $FRONTEND_IMAGE"
