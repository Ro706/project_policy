from flask import Flask, request, send_file
from gtts import gTTS
import io
from flask_cors import CORS
import time
from langdetect import detect, LangDetectException

app = Flask(__name__)
CORS(app)

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    text = request.json.get('text')
    # Make lang parameter optional
    lang = request.json.get('lang')

    if not text:
        return "Text not provided", 400

    try:
        # Auto-detect language if not provided
        if not lang:
            try:
                lang = detect(text)
            except LangDetectException:
                # Fallback to English if detection fails
                lang = 'en'
                print("Language detection failed, falling back to 'en'")

        start_time = time.time()
        # gTTS can be slow for longer texts.
        # For lower latency, consider using a different TTS engine or implementing streaming.
        tts = gTTS(text=text, lang=lang)
        
        # Save to a memory file
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0) # Reset the file pointer to the beginning

        generation_time = time.time() - start_time
        print(f"gTTS audio generation for lang '{lang}' took: {generation_time:.2f}s")
        
        return send_file(mp3_fp, mimetype='audio/mpeg', as_attachment=True, download_name='audio.mp3')
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(port=5001)
