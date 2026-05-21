FROM python:3.12-slim

WORKDIR /app
COPY pricepulse_worker ./pricepulse_worker

ENV PYTHONUNBUFFERED=1
CMD ["python", "-m", "pricepulse_worker.worker"]
