## Deploying Your Project (Explained Like You’re 10)

This file explains how to put your project on the internet.  
You already have:

- **Backend**: Django (Python) in the `backend` folder
- **Frontend**: Next.js (React) in the `frontend` folder
- **Docker** files to run everything in containers

We will first deploy **without PostgreSQL** (using the simple built‑in SQLite database),  
then explain **how to switch to PostgreSQL later**.

---

## Part 0 – What you need before starting

- A **VPS server** (for example an Ubuntu server on a cloud provider).
- **Docker** and **docker‑compose** (or the newer `docker compose`) installed on the VPS.
- **Nginx** installed on the VPS (this is the “doorman” that routes domains).
- A domain `enlightbook.com` where you can edit **DNS**.

Your backend will be at:

- **Domain**: `tilakapi.enlightbook.com`
- **Backend port on VPS**: `8001` (or another free port if 8001 is taken)

> Think of the VPS as an apartment building, Nginx as the doorman, and each project as an apartment (port).

---

## Part 1 – Point the domain to your VPS

1. Go to your domain provider (where you manage DNS for `enlightbook.com`).
2. Create an **A record**:
   - **Name / Host**: `tilakapi`
   - **Type**: `A`
   - **Value**: `YOUR_VPS_PUBLIC_IP` (for example `123.45.67.89`)
3. Save the record and wait 5–30 minutes.
4. Test from your local computer:

```bash
ping tilakapi.enlightbook.com
```

If it shows your VPS IP, DNS is working.

---

## Part 2 – Copy the project to the VPS

On your **local Windows machine**:

1. Go to the folder `D:\Registration`.
2. Right‑click the `Registration` folder → **Send to → Compressed (zipped) folder**.
3. This creates something like `Registration.zip`.

Upload `Registration.zip` to your VPS (for example using WinSCP, FileZilla, or your provider’s file upload).

On your **VPS terminal**:

```bash
cd ~
unzip Registration.zip
cd Registration
ls
```

You should see:

- `backend/`
- `frontend/`
- `DEPLOYMENT.md` (this file)

---

## Part 3 – Choose a free port for the backend

We plan to use **8001** (as in `backend/docker-compose.yml`).

On the VPS, check if 8001 is already in use:

```bash
sudo ss -tulpn | grep 8001
```

- If **nothing prints** → port 8001 is free, you can use it.
- If **something appears** → choose another port (for example `9001`) and:
  - Ask a developer to change this in `backend/docker-compose.yml`:

    ```yaml
    ports:
      - "8001:80"
    ```

    to:

    ```yaml
    ports:
      - "9001:80"
    ```

  - Everywhere below where you see `8001`, use `9001` instead.

---

## Part 4 – Create the backend production env file (SQLite)

You will use Django’s simple built‑in SQLite database first (no PostgreSQL yet).

On the VPS:

```bash
cd ~/Registration/backend
nano .env.prod
```

Paste something like this (change values as needed):

```env
DJANGO_SECRET_KEY=change_this_to_a_long_random_string
DEBUG=False
DJANGO_ALLOWED_HOSTS=tilakapi.enlightbook.com,127.0.0.1,localhost
DJANGO_CSRF_TRUSTED_ORIGINS=https://tilakapi.enlightbook.com
```

Save and exit:

- Press `Ctrl + O`, then Enter
- Press `Ctrl + X`

> For now we **do not change** the database settings in `settings.py`,  
> so Django will keep using `db.sqlite3` (SQLite).

---

## Part 5 – Start the backend with Docker (using SQLite)

On the VPS, in `~/Registration/backend`:

```bash
cd ~/Registration/backend
docker compose up --build -d
# If the above fails, try:
# docker-compose up --build -d
```

This will:

- Build the backend image.
- Start containers:
  - `django-web` (Django + Gunicorn)
  - `frontend-proxy` (Nginx inside Docker, listening on port 80 in the container)
  - `db` (PostgreSQL, not used yet by Django, but safe to run)

Check running containers:

```bash
docker ps
```

You should see containers for `django-web`, `frontend-proxy`, and `db`.

Test the backend from the VPS:

```bash
curl http://127.0.0.1:8001/
```

If you see HTML or any response (not an error like “connection refused”), the backend is running.

---

## Part 6 – Configure Nginx on the VPS for `tilakapi.enlightbook.com`

Now we tell **host Nginx** (the main doorman on the VPS):

> “When someone visits `tilakapi.enlightbook.com`, send them to `http://127.0.0.1:8001`.”

On the VPS:

```bash
sudo nano /etc/nginx/sites-available/tilakapi.enlightbook.com
```

Paste this:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tilakapi.enlightbook.com;

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and exit (`Ctrl + O`, Enter, `Ctrl + X`).

Enable this site:

```bash
sudo ln -s /etc/nginx/sites-available/tilakapi.enlightbook.com /etc/nginx/sites-enabled/tilakapi.enlightbook.com
```

Test Nginx config:

```bash
sudo nginx -t
```

If it says `syntax is ok` and `test is successful`, reload Nginx:

```bash
sudo systemctl reload nginx
```

Now open a browser on your computer and visit:

```text
http://tilakapi.enlightbook.com
```

You should see your Django app (over HTTP).

---

## Part 7 – Add HTTPS (optional but recommended)

To get `https://tilakapi.enlightbook.com` with the lock icon:

1. Install Certbot (if not already):

   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. Run Certbot:

   ```bash
   sudo certbot --nginx -d tilakapi.enlightbook.com
   ```

3. Follow the prompts:
   - Enter your email
   - Agree to terms
   - Choose the option to **redirect HTTP to HTTPS** if asked.

Then visit:

```text
https://tilakapi.enlightbook.com
```

Your backend should now be served over HTTPS.

---

## Part 8 – (Optional) Deploy the Frontend with Docker

If you want to also run the **Next.js frontend** on the same VPS using Docker:

1. On the VPS, go to the frontend folder:

   ```bash
   cd ~/Registration/frontend
   ```

2. Create a `.env` file (if your frontend needs to know the backend URL), for example:

   ```bash
   nano .env
   ```

   Inside:

   ```env
   NEXT_PUBLIC_API_URL=https://tilakapi.enlightbook.com
   ```

3. Build the frontend image:

   ```bash
   docker build -t registration-frontend .
   ```

4. Run the frontend container (example on port 3000):

   ```bash
   docker run -d --name registration-frontend -p 3000:3000 registration-frontend
   ```

5. You can then:
   - Visit `http://YOUR_VPS_IP:3000` directly, or
   - Add another Nginx config (like `app.enlightbook.com`) to proxy to `127.0.0.1:3000`.

---

## Part 9 – Later: Switching from SQLite to PostgreSQL

Right now, your Django `settings.py` uses **SQLite**:

- `ENGINE = 'django.db.backends.sqlite3'`
- Data is stored in a file called `db.sqlite3`.

This is fine for starting and learning.  
When you’re ready to use **PostgreSQL** (more powerful and robust), do this:

### 9.1. Understand the pieces

- The `docker-compose.yml` already defines a service:

  - `db` using image `postgres:17`
  - A volume `postgres_data` so data is saved.

- PostgreSQL is like a separate “database box” that Django connects to over the network.

### 9.2. Add database settings to `.env.prod`

On the VPS, edit `~/Registration/backend/.env.prod`:

```bash
cd ~/Registration/backend
nano .env.prod
```

Add lines like (choose your own secure values):

```env
POSTGRES_DB=registration_db
POSTGRES_USER=registration_user
POSTGRES_PASSWORD=super_secret_password
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

Save and exit.

### 9.3. Update Django `DATABASES` (requires a code change)

> This step **changes code**, so do it only when you’re ready or ask a developer.  
> Shown here just so you know what it will look like.

In `backend/config/settings.py`, replace the `DATABASES` section with something like:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}
```

Commit/push this change and redeploy (or edit directly on the server if you know what you’re doing).

### 9.4. Rebuild and run with Docker

On the VPS, in `~/Registration/backend`:

```bash
docker compose down
docker compose up --build -d
```

Your `entrypoint.prod.sh` already runs:

```bash
python manage.py migrate --noinput
```

So after restart:

- Django connects to PostgreSQL (`db` service).
- Migrations create the tables in the PostgreSQL database.

### 9.5. Access PostgreSQL (optional)

If you want to look inside the PostgreSQL database:

1. Find the Postgres container name:

   ```bash
   docker ps
   ```

2. Attach to it with `psql`:

   ```bash
   docker exec -it <postgres-container-name> psql -U $POSTGRES_USER -d $POSTGRES_DB
   ```

   Replace `<postgres-container-name>` with the actual name from `docker ps`.

3. Inside `psql`, you can run commands like:

   ```sql
   \dt;          -- list tables
   SELECT * FROM auth_user;  -- see users, for example
   \q            -- quit
   ```

---

## Quick Summary

- **Right now (beginner‑friendly):**
  - Use **SQLite** (no database config changes needed).
  - Deploy with Docker and Nginx using port 8001.
  - Use DNS + Nginx + (optional) Certbot for `https://tilakapi.enlightbook.com`.

- **Later (more advanced):**
  - Fill in PostgreSQL env vars in `.env.prod`.
  - Change Django `DATABASES` to use PostgreSQL.
  - `docker compose down && docker compose up --build -d`.
  - Your data will then live in the PostgreSQL container instead of `db.sqlite3`.


