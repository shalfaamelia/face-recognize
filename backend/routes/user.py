from flask import Blueprint, request, jsonify
from db import get_db_connection

user_bp = Blueprint('users', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id,name,email,role FROM users")
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(users)