from flask import Blueprint, request, jsonify, abort
from marshmallow import ValidationError
from app.models.feedback_model import Feedback
from app.extensions import db
from app.schemas import feedback_schema

feedback_bp = Blueprint('feedback_bp', __name__)


@feedback_bp.route('/', methods=['POST'])
def create_feedback():
    try:
        # Validasi input menggunakan schema
        data = feedback_schema.load(request.get_json() or {})
        
        # Buat feedback baru
        fb = Feedback(**data)
        db.session.add(fb)
        db.session.commit()
        
        # Return response dengan data yang sudah divalidasi
        return jsonify({
            'message': 'Feedback created successfully',
            'feedback': feedback_schema.dump(fb)
        }), 201
    except ValidationError as err:
        return jsonify({'error': 'Validation error', 'messages': err.messages}), 400


@feedback_bp.route('/', methods=['GET'])
def list_feedbacks():
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify([f.to_profile_dict() for f in feedbacks])


@feedback_bp.route('/<int:feedback_id>', methods=['GET'])
def get_feedback(feedback_id):
    fb = Feedback.query.get_or_404(feedback_id)
    return jsonify(fb.to_profile_dict())
