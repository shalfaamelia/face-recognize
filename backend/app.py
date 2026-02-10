from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app) 

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'db_face_recognition'
}

MAPPING_FILE = os.path.join(os.path.dirname(__file__), 'nim_mapping.json')

def load_nim_mapping():
    if not os.path.exists(MAPPING_FILE):
        return {}
    with open(MAPPING_FILE, 'r') as f:
        return json.load(f)

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

@app.route('/')
def index():
    return "Backend Aktif 🚀"

@app.route('/log_attendance', methods=['POST'])
def log_attendance():
    data = request.get_json()
    name = data.get('name')
    timestamp = data.get('timestamp', datetime.now())

    mapping = load_nim_mapping()
    nim = mapping.get(name, "UNKNOWN")

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        INSERT INTO log_masuk (nama, nim, masuk)
        VALUES (%s, %s, %s)
    """
    cursor.execute(sql, (name, nim, timestamp))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Attendance logged",
        "nama": name,
        "nim": nim
    }), 201

@app.route('/monitoring', methods=['GET'])
def get_monitoring():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, nama, nim, masuk
        FROM log_masuk
        ORDER BY masuk DESC
    """)
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)