# Chạy full-stack bằng Docker

## Yêu cầu

- Docker & Docker Compose

## Chạy nhanh

1. **Tạo file env** (tùy chọn – đã có giá trị mặc định):

   ```bash
   cp .env.example .env
   # Chỉnh .env nếu cần (port, mật khẩu MongoDB, JWT_SECRET...)
   ```

2. **Build và chạy:**

   ```bash
   docker compose up -d --build
   ```

3. **Truy cập:**

   - Frontend: http://localhost:3000  
   - Backend API: http://localhost:3001  

## Cấu trúc

| Service   | Port (mặc định) | Mô tả                |
|----------|------------------|----------------------|
| frontend | 3000             | Next.js              |
| backend  | 3001             | NestJS API           |
| mongo    | 27017            | MongoDB (trong Docker) |

## Dùng MongoDB ngoài (không dùng container mongo)

1. Trong `.env` đặt `MONGODB_URI` trỏ tới MongoDB của bạn.
2. Chạy chỉ backend và frontend:

   ```bash
   docker compose up -d --build backend frontend
   ```

   (Bỏ qua service `mongo`.)

## Lệnh hữu ích

```bash
# Xem log
docker compose logs -f

# Dừng và xóa container
docker compose down

# Dừng và xóa cả volume (xóa dữ liệu MongoDB)
docker compose down -v
```

## Build & push images (deploy VPS)

Script: `scripts/docker-build-push.sh` (dùng `docker buildx`, có hỗ trợ `--platform`).

Ví dụ với GHCR:

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

Kết quả images:
- `ghcr.io/<namespace>/coreweb-backend:latest`
- `ghcr.io/<namespace>/coreweb-frontend:latest`
