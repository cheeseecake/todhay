FROM python:3.10

# Don't buffer terminal output
ENV PYTHONUNBUFFERED 1

# Explicitly copy requirements.txt, so that pip install will run whenever it changes
COPY requirements.txt /backend/
WORKDIR /backend
RUN pip install -r requirements.txt

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]