from datetime import datetime, timezone
from fastapi import FastAPI

app = FastAPI(title="ODYSSEY AI Service", version="0.1.0")

@app.get('/health')
def health():
    return {
        'success': True,
        'data': {
            'service': 'odyssey-ai',
            'status': 'ok',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    }
