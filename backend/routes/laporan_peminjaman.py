from flask import Blueprint, request, jsonify
from db import get_db_connection

laporan_peminjaman_bp = Blueprint('laporan_peminjaman', __name__)


def format_peminjaman_row(row):
    if row.get('tanggal'):
        row['tanggal'] = row['tanggal'].isoformat()
    if row.get('jam_mulai'):
        row['jam_mulai'] = str(row['jam_mulai'])
    if row.get('jam_selesai'):
        row['jam_selesai'] = str(row['jam_selesai'])
    return row


@laporan_peminjaman_bp.route('/laporan/peminjaman', methods=['GET'])
def get_laporan_peminjaman():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id, user_id, nama, nim, prodi, kelas,
                   tanggal, jam_mulai, jam_selesai,
                   keterangan, status, created_at, updated_at
            FROM peminjaman_lab
            WHERE status IN ('disetujui', 'ditolak')
            ORDER BY updated_at DESC, tanggal DESC, jam_mulai DESC
        """)
        data = cursor.fetchall()

        data = [format_peminjaman_row(row) for row in data]

        return jsonify(data), 200

    except Exception as e:
        return jsonify({
            "message": f"Gagal mengambil laporan peminjaman: {str(e)}"
        }), 500
    finally:
        cursor.close()
        conn.close()


@laporan_peminjaman_bp.route('/laporan/peminjaman/<int:peminjaman_id>', methods=['GET'])
def get_detail_laporan_peminjaman(peminjaman_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT id, user_id, nama, nim, prodi, kelas,
                   tanggal, jam_mulai, jam_selesai,
                   keterangan, status, created_at, updated_at
            FROM peminjaman_lab
            WHERE id = %s
              AND status IN ('disetujui', 'ditolak')
        """, (peminjaman_id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"message": "Data laporan peminjaman tidak ditemukan"}), 404

        row = format_peminjaman_row(row)

        return jsonify(row), 200

    except Exception as e:
        return jsonify({
            "message": f"Gagal mengambil detail laporan peminjaman: {str(e)}"
        }), 500
    finally:
        cursor.close()
        conn.close()