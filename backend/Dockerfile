#base image
FROM python:3.12-slim

#env veriables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

#working directory
WORKDIR /app

#dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc\
    && rm -rf /var/lib/apt/lists/*

#cache opt 
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

#port
EXPOSE 8000

#run command
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
