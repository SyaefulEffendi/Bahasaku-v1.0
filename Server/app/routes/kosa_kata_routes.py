from flask import Blueprint, request, jsonify
from app.models.kosa_kata_model import KosaKata
from app.extensions import db
from sqlalchemy.exc import IntegrityError

kosa_kata_bp = Blueprint('kosa_kata_bp', __name__)


@kosa_kata_bp.route('/', methods=['POST'])
def create_kosa_kata():
    data = request.get_json() or {}
    text = data.get('text')
    video_file_path = data.get('video_file_path')
    category = data.get('category', 'Lainnya')
    added_by_admin_id = data.get('added_by_admin_id')

    if not text or not video_file_path:
        return jsonify({'error': 'text and video_file_path are required'}), 400

    kk = KosaKata(text=text, video_file_path=video_file_path, category=category, added_by_admin_id=added_by_admin_id)
    db.session.add(kk)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'text must be unique'}), 400

    return jsonify({'message': 'KosaKata created', 'kosa_kata': kk.to_dict()}), 201


@kosa_kata_bp.route('/', methods=['GET'])
def list_kosa_kata():
    items = KosaKata.query.order_by(KosaKata.created_at.desc()).all()
    return jsonify([i.to_detail_dict() for i in items])


@kosa_kata_bp.route('/<int:item_id>', methods=['GET'])
def get_kosa_kata(item_id):
    item = KosaKata.query.get_or_404(item_id)
    return jsonify(item.to_detail_dict())
