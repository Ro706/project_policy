from flask import Flask, request, send_file
from gtts import gTTS
import os
from flask_cors import CORS

import time

app = Flask(__name__)
CORS(app)

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    text = request.json.get('text')
    lang = request.json.get('lang', 'en')

    if not text:
        return "Text not provided", 400

    try:
        start_time = time.time()
        # gTTS can be slow for longer texts.
        # For lower latency, consider using a different TTS engine or implementing streaming.
        tts = gTTS(text=text, lang=lang)
        filename = "temp_audio.mp3"
        tts.save(filename)
        generation_time = time.time() - start_time
        print(f"gTTS audio generation took: {generation_time:.2f}s")
        return send_file(filename, as_attachment=True)
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(port=5001)
