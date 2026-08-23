FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
RUN addgroup --system odyssey && adduser --system --ingroup odyssey odyssey
COPY apps/ai/requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt
COPY --chown=odyssey:odyssey apps/ai/app ./app
USER odyssey
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
