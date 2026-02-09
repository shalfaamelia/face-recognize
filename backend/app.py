from flask import Flask, request, jsonify
import mysql.connector
from datetime import datetime
import json
import os

app = Flask(__name__)

@app.route('/')
def index():
    return "Backend Face Recognition aktif 🚀"

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '', 
    'database': 'db_face_recognition' 
}

MAPPING_FILE = os.path.join(os.path.dirname(__file__), 'nim_mapping.json')

def load_nim_mapping():
    if not os.path.exists(MAPPING_FILE):
        print(f"Warning: Mapping file {MAPPING_FILE} not found. Using empty mapping.")
        return {}
    try:
        with open(MAPPING_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"Error: Failed to decode JSON from {MAPPING_FILE}.")
        return {}

NIM_MAPPING = load_nim_mapping()

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

@app.route('/log_attendance', methods=['POST'])
def log_attendance():
    current_mapping = load_nim_mapping()
    
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400

    name = data['name']
    timestamp = data.get('timestamp', datetime.now().isoformat())
    
    nim = current_mapping.get(name, "UNKNOWN")

    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor()
        
        sql = "INSERT INTO mahasiswa (nama, nim, masuk) VALUES (%s, %s, %s)"
        val = (name, nim, timestamp)
        cursor.execute(sql, val)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': f'Attendance logged for {name}', 'nim': nim}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': f'Database error: {err}'}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)