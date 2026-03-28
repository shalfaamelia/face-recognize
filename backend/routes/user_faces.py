from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from db import get_db_connection

user_faces_bp = Blueprint('user_faces', __name__)

# Folder untuk menyimpan foto user
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'dataset')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Pastikan folder ada
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ===============================
# UPLOAD FOTO USER
# ===============================
@user_faces_bp.route('/user_faces/upload/<int:user_id>', methods=['POST'])
def upload_user_face(user_id):
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)

        # Ambil face_label user dari database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT face_label FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            conn.close()
            return jsonify({"message": "User not found"}), 404

        face_label = user['face_label']

        # Buat folder sesuai face_label
        user_folder = os.path.join(UPLOAD_FOLDER, face_label)
        os.makedirs(user_folder, exist_ok=True)

        # Simpan file
        file_path = os.path.join(user_folder, filename)
        file.save(file_path)

        # Simpan record ke tabel user_faces
        cursor.execute(
            "INSERT INTO user_faces (user_id, image_path, image_name) VALUES (%s,%s,%s)",
            (user_id, file_path, filename)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "File uploaded successfully", "file_path": file_path}), 201
    else:
        return jsonify({"message": "Invalid file type"}), 400


# ===============================
# GET FOTO USER
# ===============================
@user_faces_bp.route('/user_faces/<int:user_id>', methods=['GET'])
def get_user_faces(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, image_path, image_name, created_at FROM user_faces WHERE user_id=%s",
        (user_id,)
    )
    photos = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(photos)