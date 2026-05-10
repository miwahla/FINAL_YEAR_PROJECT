# LeafEye Backend

Simple Node.js Express server for text-to-speech synthesis using ElevenLabs API.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create .env file
Copy `.env.example` to `.env` and add your ElevenLabs API key:
```bash
cp .env.example .env
```

Then edit `.env`:
```
ELEVENLABS_API_KEY=sk_6e5f5a5a1b7ac51049377ac9a3bd39f1f6419f18c8abcc2b
PORT=3000
```

### 3. Run the Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Text-to-Speech
```
POST /api/tts
Content-Type: application/json

Body:
{
  "text": "The text you want to convert to speech",
  "language": "en"  // or "ur" for Urdu
}

Response:
{
  "audioUrl": "data:audio/mpeg;base64,SUQz...",
  "language": "en",
  "textLength": 45
}
```

## Testing with cURL

```bash
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test",
    "language": "en"
  }'
```

## Deployment

### Option 1: Railway.app (recommended)
1. Push this to GitHub
2. Go to railway.app
3. Connect GitHub repo
4. Set `ELEVENLABS_API_KEY` environment variable
5. Deploy!

### Option 2: Render.com
1. Push to GitHub
2. Go to render.com
3. Create new Web Service
4. Connect repo
5. Set env vars
6. Deploy!

### Option 3: Heroku
```bash
heroku create leafeye-backend
heroku config:set ELEVENLABS_API_KEY=your_key
git push heroku main
```
