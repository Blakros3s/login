#!/usr/bin/env bash

# Ensure staticfiles directory exists (appuser can create subdirectories)
mkdir -p /app/staticfiles

python manage.py collectstatic --noinput || echo "Warning: collectstatic failed, continuing anyway..."
python manage.py migrate --noinput
python -m gunicorn --bind 0.0.0.0:8000 --workers 3 config.wsgi:application
