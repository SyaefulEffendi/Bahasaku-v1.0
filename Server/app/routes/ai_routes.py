from flask import Blueprint, request, jsonify
from ultralytics import YOLO
from app.models.kosa_kata_model import KosaKata
import cv2
import numpy as np
import os

ai_bp = Blueprint('ai_bp', __name__)

MODEL_PATH = os.path.join(os.getcwd(), 'app', 'models_ml', 'best.pt') 
try:
    model = YOLO(MODEL_PATH)
    print("YOLOv8 Model Loaded Successfully!")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    model = None

@ai_bp.route('/predict', methods=['POST'])
def predict_sign():
    if not model:
        return jsonify({'error': 'Model ML belum siap'}), 500
        
    if 'image' not in request.files:
        return jsonify({'error': 'No image sent'}), 400
        
    file = request.files['image']
    
    # 1. Baca gambar dari request
    img_bytes = file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # 2. Prediksi menggunakan YOLO
    results = model(img)
    
    detected_text = None
    confidence = 0
    
    # Ambil hasil prediksi terbaik
    for result in results:
        if result.boxes:
            # Ambil box dengan confidence tertinggi
            box = result.boxes[0] 
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            detected_text = model.names[class_id] # Ini nama class dari YOLO (misal: "A", "Halo")
            break
            
    if not detected_text:
        return jsonify({'text': '', 'found_in_db': False}), 200
        
    # 3. Cek apakah ada di Database KosaKata (Sesuai permintaan Anda)
    # Kita cari text yang MIRIP atau SAMA PERSIS
    db_item = KosaKata.query.filter(KosaKata.text.ilike(detected_text)).first()
    
    return jsonify({
        'text': detected_text,
        'confidence': confidence,
        'found_in_db': bool(db_item), # True jika ada di database
        'db_detail': db_item.to_detail_dict() if db_item else None
    })