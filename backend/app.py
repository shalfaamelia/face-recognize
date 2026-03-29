from flask import Flask
from flask_cors import CORS

from routes.monitoring import monitoring_bp
from routes.attendance import attendance_bp
from routes.user import user_bp
from routes.user_faces import user_faces_bp
from routes.jadwal import jadwal_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(monitoring_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(user_faces_bp, url_prefix='/api/user_faces') 
app.register_blueprint(jadwal_bp, url_prefix='/api/jadwal')

@app.route('/')
def index():
    return "Backend Aktif 🚀"

if __name__ == '__main__':
    app.run(debug=True)