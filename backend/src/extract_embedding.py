# Extract embeddings dari raw images dan simpan ke file .npz
import os # Membaca file dataset wajah
import cv2 # Membaca gambar dan konversi warna
import numpy as np # Menyimpan embeddings dan label ke file .npz
from detector import FaceDetector
from aligner import align_face
from embedder import FaceEmbedder

DATASET = "data/raw_faces"
OUT_FILE = "data/embeddings.npz"

detector = FaceDetector("models/haarcascade_frontalface_default.xml")
embedder = FaceEmbedder("models/facenet.tflite")

X = [] # Menyimpan embeddings
y = [] # Menyimpan label nama orang

# Loop melalui setiap orang di dataset
for person in os.listdir(DATASET):
    person_dir = os.path.join(DATASET, person)
    if not os.path.isdir(person_dir):
        continue

    # Loop melalui setiap gambar orang tersebut
    for img_name in os.listdir(person_dir):
        img_path = os.path.join(person_dir, img_name)
        img = cv2.imread(img_path)
        if img is None:
            continue
        
        # Ubah gambar ke grayscale untuk deteksi wajah
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = detector.detect(gray)

        if len(faces) == 0:
            continue
        
        # Ambil wajah pertama yang terdeteksi dan potong serta ubah ukurannya
        face = align_face(img, faces[0])
        # Ekstrak embedding dari wajah yang telah dipotong dengan CNN
        emb = embedder.embed(face)

        X.append(emb)
        y.append(person)

# Ubah daftar ke array numpy dan simpan ke file .npz
X = np.array(X)
y = np.array(y)

np.savez(OUT_FILE, X=X, y=y)
print(f"Saved {len(X)} embeddings to {OUT_FILE}")