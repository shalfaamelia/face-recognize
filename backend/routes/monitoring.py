from flask import Blueprint, jsonify
from db import get_db_connection

monitoring_bp = Blueprint('monitoring', __name__)

@monitoring_bp.route('/monitoring', methods=['GET'])
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