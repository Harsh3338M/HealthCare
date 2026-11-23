# Backend Deployment Plan (Render & Docker)

## 1️⃣ Deploying to Render (Native Python Service)

| Step | Action |
|------|--------|
| **1** | **Create a new Web Service** in the Render dashboard and connect it to this GitHub repository.
| **2** | **Set the Build Command** to install dependencies:
```
pip install -r requirements.txt
```
| **3** | **Set the Start Command** (Render runs the process directly, no `uvicorn` daemon needed):
```
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
| **4** | **Add Environment Variables** – copy the values from your local `.env` (do **not** commit the file). In the Render UI click **Environment** → **Add Variable** for each key:
- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `UPLOAD_DIR` (default `lab-data/uploads`)
- `BACKUP_DIR` (default `lab-data/backups`)
| **5** | **Persist Uploaded Files** – Render provides an attached **disk**. Create a **Persistent Disk** (e.g., `medivault-data`, 5 GB) and mount it to `/app/lab-data`. Update the env vars if you change the mount path.
| **6** | **Deploy** – Click **Deploy**. Render will clone the repo, run the build command, and start the FastAPI service. The public URL is shown on the service page.

### 👉 Notes for Render
- No Dockerfile is required for the **native** service.
- If you need a custom OS/runtime, switch to a **Docker** service (see section 2).
- Render automatically restarts the service on code pushes.

---

## 2️⃣ Deploying to Render (Docker Service)

1. **Add a `Dockerfile`** at the repository root (see the Dockerfile snippet below).
2. **Push the Dockerfile** to GitHub; Render will detect it.
3. In Render, choose **Create a New Service → Docker** and select the same repo.
4. **Set the Docker Build Context** to `.` and the Dockerfile path to `Dockerfile`.
5. **Specify the Start Command** (optional – the Dockerfile uses `CMD`):
   ```
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```
6. **Configure Environment Variables** as in the native deployment.
7. **Configure a Persistent Disk** for `lab-data` (same as above) and mount it in the Dockerfile or via Render’s **Disk** settings.
8. **Deploy** – Render builds the image, pushes it to its internal registry, and runs the container.

---

## 3️⃣ Stand‑alone Docker Deployment (Local / Any Cloud)

```Dockerfile
# ---------- Dockerfile ----------
FROM python:3.11-slim AS base
WORKDIR /app

# Install system dependencies (if any)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend ./backend
COPY scripts ./scripts   # optional – only needed for seeding
COPY .env.example .env   # keep a template, never the real secrets

# Expose the default FastAPI port
EXPOSE 8000

# Runtime command
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
# --------------------------------
```

### Build & Run
```bash
# Build the image (replace <tag> with your repo name)
docker build -t medivault-backend:<tag> .

# Run the container (mount a host directory for persistent uploads/backups)
# Adjust the paths to where you want to store files on the host.
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL=sqlite:///./medivault.db \
  -e SECRET_KEY=your-secret-key \
  -e ALGORITHM=HS256 \
  -e ACCESS_TOKEN_EXPIRE_MINUTES=60 \
  -e UPLOAD_DIR=/data/uploads \
  -e BACKUP_DIR=/data/backups \
  -v $(pwd)/lab-data:/data   # host <-> container persistent storage
  medivault-backend:<tag>
```

### Pushing to a Registry (Docker Hub / Render)
```bash
docker tag medivault-backend:<tag> yourdockerhubuser/medivault-backend:<tag>
docker push yourdockerhubuser/medivault-backend:<tag>
```

After pushing, you can reference the image in any cloud service (Render, Cloudflare Workers, etc.) and supply the same env‑vars.

---

## 4️⃣ Security & Maintenance Tips
- **Never commit** the real `.env` file. Keep only `.env.example` in the repo.
- Rotate `SECRET_KEY` regularly and store it in the Render **Secrets** UI.
- Use a **managed database** for production instead of SQLite.
- Enable **HTTPS** (Render provides it automatically) and set `ALLOWED_HOSTS` accordingly if you add custom host checks.
- Regularly prune the persistent disk to avoid runaway storage usage.

---

*This file (`deploy.md`) lives in the repository root and is intended for developers and ops engineers preparing the backend for production.*
