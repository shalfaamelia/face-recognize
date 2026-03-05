from flask import Flask
from flask_cors import CORS

from routes.monitoring import monitoring_bp
from routes.attendance import attendance_bp
from routes.user import user_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(monitoring_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(user_bp)

@app.route('/')
def index():
    return "Backend Aktif 🚀"

if __name__ == '__main__':
    app.run(debug=True)