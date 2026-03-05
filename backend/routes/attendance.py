from flask import Blueprint, request, jsonify
from datetime import datetime
from db import get_db_connection

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/log_attendance', methods=['POST'])
def log_attendance():
    data = request.get_json()

    name = data.get('name')
    timestamp = data.get('timestamp', datetime.now())

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
        INSERT INTO log_masuk (nama, nim, masuk)
        VALUES (%s, %s, %s)
    """

    cursor.execute(sql, (name, "UNKNOWN", timestamp))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Attendance logged"}), 201