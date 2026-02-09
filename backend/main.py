import os
import cv2 # Untuk membaca video dari webcam
import requests
import time
from datetime import datetime
from src.detector import FaceDetector
from src.aligner import align_face
from src.embedder import FaceEmbedder
from src.recognizer import FaceRecognizer

# Load semua model yang diperlukan
detector = FaceDetector("models/haarcascade_frontalface_default.xml")
embedder = FaceEmbedder("models/facenet.tflite")
recognizer = FaceRecognizer("models/face_model.pkl")

# Backend configuration
BACKEND_URL = "http://localhost:5000/log_attendance"
LOG_COOLDOWN = 5
last_logged = {}

def log_to_backend(name):
    current_time = time.time()
    if name in last_logged and current_time - last_logged[name] < LOG_COOLDOWN:
        return

    try:
        timestamp = datetime.now().isoformat()
        payload = {'name': name, 'timestamp': timestamp}
        response = requests.post(BACKEND_URL, json=payload, timeout=2)
        if response.status_code == 201:
            print(f"Logged attendance for {name}")
            last_logged[name] = current_time
        else:
            print(f"Failed to log attendance: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to backend: {e}")

# Inisialisasi webcam
cap = cv2.VideoCapture(0)

if cap is not None and cap.isOpened():
    print("Webcam detected. Starting real-time recognition...")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector.detect(gray)

        for (x, y, w, h) in faces:
            try:
                face = align_face(frame, (x, y, w, h))
                emb = embedder.embed(face)
                name = recognizer.predict(emb)

                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(frame, name, (x, y-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                
                log_to_backend(name)

            except Exception as e:
                continue

        cv2.imshow("Face Recognition (Webcam)", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
else:
    print("Webcam not found or could not be opened. Reverting to test folder...")
    test_dir = "data/test"
    
    if os.path.exists(test_dir):
        for filename in os.listdir(test_dir):
            if not filename.lower().endswith((".jpg", ".png", ".jpeg")):
                continue

            img_path = os.path.join(test_dir, filename)
            frame = cv2.imread(img_path)

            if frame is None:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detector.detect(gray)

            for (x, y, w, h) in faces:
                try:
                    face = align_face(frame, (x, y, w, h))
                    emb = embedder.embed(face)
                    name = recognizer.predict(emb)

                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    cv2.putText(frame, name, (x, y-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                    
                    log_to_backend(name)
                    
                except Exception as e:
                    continue

            cv2.imshow("Face Recognition (Test Folder)", frame)
            print(f"Processed {filename}. Press any key for next image, 'q' to quit.")
            key = cv2.waitKey(0)

            if key == ord("q"):
                break
    else:
        print(f"Test directory '{test_dir}' not found.")

cv2.destroyAllWindows()