"""
gcp_app_engine/blueprints/api/views.py
"""

import json
import requests
import firebase_admin
from datetime import datetime
from flask import Blueprint, jsonify, request, session, current_app, Response
from pydub import AudioSegment
from io import BytesIO
from firebase_admin import firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()
db = firestore.client()

blueprint_api = Blueprint('api', __name__)

ALLOWED_PROPERTIES_API_PROFILE = {'name'}


@blueprint_api.before_request
def verify_authentication():
    """
    Verify if the user is authenticated before processing the request.

    Returns:
    - Response: JSON message
    """
    if 'profile' not in session:
        return jsonify({"error": "Not authenticated"}), 401

    today_str = datetime.now().strftime("%Y-%m-%d")

    query = db.collection('users').where('user_id', '==', session['profile']['id']).limit(1).stream()
    doc_ref = next(query, None)
    if doc_ref:
        doc = doc_ref.to_dict()

        if 'latest_use' in doc:
            if len(doc['latest_use']) == 5:
                if doc['latest_use'][0] == today_str:
                    return jsonify({"error": "Free quota ran out"}), 401
                doc['latest_use'].pop(0)
            doc['latest_use'].append(today_str)
        else:
            doc['latest_use'] = [today_str]
        doc_ref.reference.update({"latest_use": doc['latest_use']})
    else:
        db.collection('users').add({
            "user_id": session['profile']['id'],
            "latest_use": [today_str]
        })

    return None


@blueprint_api.route('/chat', methods=['GET', 'POST'])
def chat():
    data = request.json
    model = data.get('model')
    messages = data.get('messages')

    if not model or not messages:
        return {"error": "Model and messages are required"}, 400

    if "original_text" in messages:
        messages['original_text'] = messages['original_text'].replace("\"", "\\\"")[:1000]
        messages['polished_result'] = messages['polished_result'].replace("\"", "\\\"")[:1000]
        messages = [{"role": "user", "content": ""}, 
                    {"role": "user", 
                     "content": f" {{ 'original_text' : \"{messages['original_text']}\",  'polished_result': \"{messages['polished_result']}\" }} // Write a JSON message that includes a single attribute named 'description', which explains the changes made in detail, as if written by the bot. Please suggest an expression which sounds more natural to native speakers and add it to the 'another_suggested_expression' attribute if it exists."
                    }]
    else:
        translate = messages[1][:20] if len(messages) == 2 else None
        messages[0] = messages[0][:1000].replace('"', '\\"')
        messages = [{"role": "user", "content": ""},
                    {"role": "user", "content": f"Text: {messages[0]} // "}]
        if translate:
            messages[1]["content"] += f"Translate this text into {translate} and write the result to a JSON message which has a single attribute named 'translated_result'.";
        else:
            messages[1]["content"] += "Write a JSON message. First, rate how natural and correct the above text sounds on a scale from 1 to 5, and add the score to the 'score' attribute. Second, add the original text to the 'result' attribute if it sounds grammatically natural and sufficiently casual. Polish it otherwise.";

    headers = {
        "Authorization": f"Bearer {current_app.config['OPENAI_API_KEY']}",
        "Content-Type": "application/json",
        "type": "json_object"
    }
    body = json.dumps({"model": model, "messages": messages, "stream": True})

    def generate():
        with requests.post("https://api.openai.com/v1/chat/completions", headers=headers, data=body) as r:
            if r.encoding is None:
                r.encoding = 'utf-8'
            for line in r.iter_lines(decode_unicode=True):
                if line:
                    yield f"{line}\n\n"

    return Response(generate(), content_type='text/event-stream')


@blueprint_api.route('/audio', methods=['GET', 'POST'])
def audio():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file provided"}), 400

    if 'audio/webm' not in file.content_type:
        return jsonify({"error": f"Invalid file type: {file.content_type}"}), 400

    audio = AudioSegment.from_file(file)
    if len(audio) > 30000:
        audio = audio[:30000]

    audio_buffer = BytesIO()
    file_format = "".join(char for char in file.content_type.split('/')[-1] if char.isalpha())
    audio.export(audio_buffer, format=file_format)
    audio_buffer.seek(0)

    language = request.form.get('language')
    data = {
        'model': request.form.get('model')
    }
    if language:
        data['language'] = language

    response = requests.post(
        "https://api.openai.com/v1/audio/transcriptions",
        headers={
            "Authorization": f"Bearer {current_app.config['OPENAI_API_KEY']}"
        },
        files={"file": (file.filename, audio_buffer, file.content_type)},
        data=data
    )

    if response.ok:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to transcribe audio"}), 500
