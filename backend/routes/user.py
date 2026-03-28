from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from db import get_db_connection

user_bp = Blueprint('users', __name__)

# Path dataset sama dengan user_faces
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'dataset')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@user_bp.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, kode, nama, face_label, role,
               nim, nip, prodi, kelas,
               email, status
        FROM users
        ORDER BY id DESC
    """)
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)  # pastikan langsung return list

@user_bp.route('/users', methods=['POST'])
def create_user():
    """
    CREATE USER dengan opsi upload foto sekaligus
    """
    # ===== Ambil data dari request =====
    if request.content_type.startswith('multipart/form-data'):
        kode = request.form.get('kode')
        nama = request.form.get('nama')
        face_label = request.form.get('face_label')
        role = request.form.get('role')
        nim = request.form.get('nim')
        nip = request.form.get('nip')
        prodi = request.form.get('prodi')
        kelas = request.form.get('kelas')
        email = request.form.get('email')
        password = request.form.get('password')
        status = request.form.get('status', 'aktif')
        file = request.files.get('file')
    else:
        data = request.get_json()
        kode = data.get('kode')
        nama = data.get('nama')
        face_label = data.get('face_label')
        role = data.get('role')
        nim = data.get('nim')
        nip = data.get('nip')
        prodi = data.get('prodi')
        kelas = data.get('kelas')
        email = data.get('email')
        password = data.get('password')
        status = data.get('status', 'aktif')
        file = None

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # ===== Cek email unik =====
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"message": f"Email '{email}' sudah terdaftar"}), 400

        # ===== INSERT USER =====
        sql_user = """
            INSERT INTO users
            (kode, nama, face_label, role, nim, nip, prodi, kelas, email, password, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
        cursor.execute(sql_user, (
            kode, nama, face_label, role,
            nim, nip, prodi, kelas, email, password, status
        ))
        user_id = cursor.lastrowid
        conn.commit()  # commit segera setelah insert user

        # ===== Upload file jika ada =====
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            user_folder = os.path.join(UPLOAD_FOLDER, face_label)
            os.makedirs(user_folder, exist_ok=True)
            file_path = os.path.join(user_folder, filename)
            file.save(file_path)

            # Insert ke tabel user_faces
            cursor.execute(
                "INSERT INTO user_faces (user_id, image_path, image_name) VALUES (%s,%s,%s)",
                (user_id, file_path, filename)
            )
            conn.commit()  # commit terpisah agar tidak lock lama

    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"Gagal membuat user: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({
        "message": "User berhasil dibuat",
        "user_id": user_id,
        "file_uploaded": file.filename if file else None
    }), 201