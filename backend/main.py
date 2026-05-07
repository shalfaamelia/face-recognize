import os
from datetime import datetime
import time
import threading
from gpiozero import DigitalOutputDevice

# Try importing Pi 5 Camera Library
try:
    from picamera2 import Picamera2
    USE_PICAM = True

except ImportError:
    USE_PICAM = False


import cv2
import requests
from src.detector import FaceDetector
from src.aligner import align_face
from src.embedder import FaceEmbedder
from src.recognizer import FaceRecognizer

# Load all models
detector = FaceDetector("models/haarcascade_frontalface_default.xml")
embedder = FaceEmbedder("models/facenet.tflite")
recognizer = FaceRecognizer("models/face_model.pkl")

# Backend config
BACKEND_URL = "http://localhost:5000/log_attendance"
USERS_API = "http://localhost:5000/api/users"
LOG_COOLDOWN = 5
last_logged = {}

# Relay config
RELAY_PIN = 27
RELAY_DURATION = 10
relay = DigitalOutputDevice(RELAY_PIN, active_high=False, initial_value=False)
relay_timer = None

relay_lock = threading.Lock()

def turn_off_relay():
    global relay_timer

    with relay_lock:
        relay.off()
        print("Relay turned OFF")
        relay_timer = None


def trigger_relay():
    global relay_timer
    with relay_lock:
        if relay_timer is not None:
            relay_timer.cancel()
        relay.on()
        print(f"Relay turned ON for {RELAY_DURATION} seconds")
        relay_timer = threading.Timer(RELAY_DURATION, turn_off_relay)
        relay_timer.start()


# =========================
# Schedule Verification
# =========================
def is_within_schedule(user):
    from db import get_db_connection

    # Non-student roles (kepala_lab, teknisi, sarpras) bypass schedule
    if user["role"] != "mahasiswa":
        print(f"Access granted for role: {user['role']}")
        return True

    if not user["kelas"]:
        print("User has no class assigned")
        return False

    now = datetime.now()
    days_map = {
        0: "Senin",
        1: "Selasa",
        2: "Rabu",
        3: "Kamis",
        4: "Jumat",
        5: "Sabtu",
        6: "Minggu",
    }
    current_day = days_map[now.weekday()]
    current_time = now.strftime("%H:%M:%S")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if user's class has a scheduled session right now
        query = """
            SELECT * FROM jadwal_praktikum 
            WHERE kelas = %s AND hari = %s 
            AND jam_mulai <= %s AND jam_selesai >= %s
        """
        cursor.execute(query, (user["kelas"], current_day, current_time, current_time))
        schedule = cursor.fetchone()

        if schedule:
            print(
                f"Schedule match: {schedule['nama']} ({schedule['jam_mulai']} - {schedule['jam_selesai']})"
            )
            return True
        else:
            print(
                f"No active schedule for {user['nama']} ({user['kelas']}) on {current_day} at {current_time}"
            )
            return False
    except Exception as e:
        print(f"Database error during schedule check: {e}")
        return False
    finally:
        cursor.close()
        conn.close()


# =========================
# Get user info from backend
# =========================
def get_user_info(face_label):

    try:
        res = requests.get(f"{USERS_API}?face_label={face_label}", timeout=2)

        if res.status_code == 200:
            users = res.json()
            if len(users) > 0:
                return users[0]  # take the first user

    except requests.exceptions.RequestException as e:
        print(f"Error fetching user info: {e}")
    return None


# =========================
# Log attendance to the backend
# =========================
def log_to_backend(face_label):
    if not face_label or face_label == "Unknown":
        return

    current_time = time.time()
    if (
        face_label in last_logged
        and current_time - last_logged[face_label] < LOG_COOLDOWN
    ):
        return

    # Update timestamp immediately to prevent race conditions from high-FPS camera
    last_logged[face_label] = current_time

    user = get_user_info(face_label)
    if not user:
        print(f"User with face_label '{face_label}' not found")
        return

    # Check schedule before opening relay
    if not is_within_schedule(user):
        print(f"Access DENIED for {user['nama']}: Outside scheduled time")
        return

    # Trigger relay for known user within schedule
    trigger_relay()

    payload = {
        "user_id": user["id"],
        "name": user["nama"],
        "timestamp": datetime.now().isoformat(),
    }

    try:
        res = requests.post(BACKEND_URL, json=payload, timeout=2)
        if res.status_code == 201:
            print(f"Attendance logged for {user['nama']}")

        else:
            print(f"Failed to log attendance: {res.text}")

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to backend: {e}")


# =========================
# Process frame for real-time or test folder
# =========================
def process_frame(frame):

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector.detect(gray)

    for x, y, w, h in faces:
        try:
            face = align_face(frame, (x, y, w, h))
            emb = embedder.embed(face)
            predicted_label = recognizer.predict(emb)  # face_label
            user = get_user_info(predicted_label)
            display_name = user["nama"] if user else "Unknown"

            # Display on frame
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(
                frame,
                display_name,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2,
            )

            # Log to backend
            if user:
                log_to_backend(predicted_label)

        except Exception as e:
            print(f"Error processing face: {e}")
            continue

    return frame


# ==============================
# CAMERA INITIALIZATION
# ==============================
camera_started = False

if USE_PICAM:

    try:
        print("Initializing Raspberry Pi Camera 3...")
        picam2 = Picamera2()

        # Set resolution. Lower is faster for real-time face recognition (e.g., 640x480)
        config = picam2.create_video_configuration(main={"size": (640, 480)})
        picam2.configure(config)
        picam2.start()
        camera_started = True

        print("Camera started successfully.")

    except Exception as e:

        print(f"Failed to start Picamera2: {e}")
        USE_PICAM = False


if camera_started:
    print("Starting real-time recognition. Press q to quit...")
    try:
        while True:
            # Picamera2 outputs in RGB, OpenCV expects BGR. Convert it.
            rgb_frame = picam2.capture_array()
            frame = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            faces = detector.detect(gray)

            for x, y, w, h in faces:
                try:
                    face = align_face(frame, (x, y, w, h))
                    emb = embedder.embed(face)
                    name = recognizer.predict(emb)

                    cv2.rectangle(frame, (x, y), (x + w, y + h),
                                  (0, 255, 0), 2)
                    cv2.putText(
                        frame,
                        name,
                        (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.8,
                        (0, 255, 0),
                        2,
                    )

                    # Log to backend
                    log_to_backend(name)

                except Exception as e:
                    # Skip face if alignment or embedding fails
                    continue

            cv2.imshow("Face Recognition (Picam 3)", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        # Clean up camera resources
        picam2.stop()
        cv2.destroyAllWindows()

else:
    print("FATAL ERROR: Camera not found. Application exiting.")
