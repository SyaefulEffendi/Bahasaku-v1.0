from flask import Blueprint, jsonify, request
from app.models.user_model import User
from app.extensions import db
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask import current_app, url_for
import os
from werkzeug.utils import secure_filename
from app.models.user_model import ROLES
import datetime

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'} # Format file yang diizinkan untuk foto profil

def allowed_file(filename): # Fungsi untuk memeriksa apakah file memiliki ekstensi yang diizinkan
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS # Memeriksa apakah file memiliki ekstensi yang diizinkan

user_bp = Blueprint('user_bp', __name__) # Membuat blueprint untuk rute user

def is_admin(user_id):
    """Mengecek apakah user dengan user_id yang diberikan memiliki role 'Admin'."""
    user = User.query.get(user_id)
    return user and user.role == 'Admin'

@user_bp.route('/register', methods=['POST']) #Mendefinisikan endpoint .../api/users/register yang merespons metode POST. Frontend Anda memanggil ini di handleSubmitAdd
def register_user():
    data = request.get_json() #Mengambil data JSON (nama, email, password, dll.) yang dikirim oleh frontend dari formState

    # Check if admin is registering (has token)
    current_user_id = None
    is_registering_admin = False
    if request.headers.get('Authorization'):
        try:
            token = request.headers.get('Authorization').split(' ')[1]
            current_user_id = get_jwt_identity()
            is_registering_admin = is_admin(current_user_id)
        except Exception:
            pass

    try:
        birth_date_str = data.get('birth_date') # Mengambil string tanggal lahir dari data
        birth_date_obj = None # Inisialisasi objek tanggal lahir sebagai None

        if birth_date_str:
            birth_date_obj = datetime.datetime.strptime(birth_date_str, '%Y-%m-%d').date() # Mengonversi string ke objek date jika ada

        new_user = User( #Membuat instance User baru dengan data yang diberikan
            full_name=data.get('full_name'),
            email=data.get('email'),
            user_type=data.get('user_type'),
            location=data.get('location'),
            birth_date=birth_date_obj
        )

        # Set role: Admin if registering admin and role provided, else User
        if is_registering_admin and 'role' in data and data.get('role') in ROLES:
            new_user.role = data.get('role')
        else:
            new_user.role = 'User'

        #Memeriksa apakah semua field wajib diisi
        if not all([new_user.full_name, new_user.email, data.get('password'), new_user.user_type]):
            return jsonify({"error": "Data tidak lengkap (nama, email, password, user_type wajib diisi)"}), 400

        #Memeriksa apakah email sudah terdaftar
        if User.query.filter_by(email=new_user.email).first():
            return jsonify({"error": "Email sudah terdaftar"}), 409

        new_user.set_password(data.get('password')) #Menyetel password dengan hashing yang aman
        db.session.add(new_user) #Menambahkan user baru ke sesi database
        db.session.commit() #Menyimpan perubahan ke database

        access_token = create_access_token(identity=str(new_user.id)) #Membuat token akses JWT untuk user baru menggunakan ID user sebagai identitas string
        return jsonify({ #Mengembalikan respons JSON dengan pesan sukses, token akses, dan data profil user
            "message": "User berhasil terdaftar dan login otomatis", #Pesan sukses
            "access_token": access_token, #Token akses JWT
            "user": new_user.to_profile_dict() #Data profil user dalam format dictionary
        }), 201 #Status kode 201 menunjukkan bahwa data baru telah berhasil dibuat

    except IntegrityError:
        db.session.rollback() #Mengembalikan sesi database jika terjadi kesalahan integritas (misalnya, email duplikat)
        return jsonify({"error": "Email sudah terdaftar"}), 400 #Mengembalikan respons error jika email sudah ada di database
    except Exception as e:
        db.session.rollback() #Mengembalikan sesi database untuk kesalahan umum lainnya
        return jsonify({"error": "Terjadi kesalahan server saat registrasi."}), 500 #Mengembalikan respons error server

# Rute untuk Login
@user_bp.route('/login', methods=['POST']) #Mendefinisikan endpoint .../api/users/login yang merespons metode POST.
def login_user(): #Menangani proses login user.
    data = request.get_json() #Mengambil data JSON (email, password, remember_me) yang dikirim oleh frontend dari formState.
    email = data.get('email') #Mengambil email dari data.
    password = data.get('password') #Mengambil password dari data.
    remember_me = data.get('remember_me', False) #Mengambil opsi remember_me dari data, defaultnya False jika tidak disediakan.

    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400

    user = User.query.filter_by(email=email).first() #Mencari user di database berdasarkan email yang diberikan.

    if not user or not user.check_password(password): #Memeriksa apakah user ditemukan dan password cocok.
        return jsonify({"error": "Email atau password salah"}), 401

    expires_delta = None  # Default expiration (8 hours as set in app config)
    if remember_me: 
        expires_delta = datetime.timedelta(days=1) # Jika remember_me diaktifkan, atur token untuk kedaluwarsa dalam 1 hari.

    access_token = create_access_token( #Membuat token akses JWT untuk user yang berhasil login.
        identity=str(user.id), #Menggunakan ID user sebagai identitas string.
        expires_delta=expires_delta #Mengatur waktu kedaluwarsa token berdasarkan opsi remember_me
    )
    
    return jsonify({ #Mengembalikan respons JSON dengan pesan sukses, token akses, dan data profil user.
        "message": "Login berhasil", #Pesan sukses
        "access_token": access_token, #Token akses JWT
        "user": user.to_profile_dict() #Data profil user dalam format dictionary
    }), 200

# Rute untuk Mendapatkan Semua User (Hanya Admin)
@user_bp.route('/', methods=['GET']) #Mendefinisikan endpoint ini di http://localhost:5000/api/users/ yang hanya merespons metode GET.
@jwt_required() #Memastikan bahwa endpoint ini hanya dapat diakses oleh pengguna yang telah terotentikasi menggunakan JWT.
def get_users(): #Mengambil semua user dari database dan mengembalikannya dalam format JSON.
    try:
        current_user_id = int(get_jwt_identity()) #Mendapatkan ID user dari token JWT yang
    except Exception:
        return jsonify({"error": "Invalid token identity."}), 401 #Jika terjadi kesalahan saat mengambil ID user, mengembalikan respons error.
    if not is_admin(current_user_id):
        return jsonify({"error": "Akses ditolak. Diperlukan hak Admin."}), 403 #Memeriksa apakah user saat ini adalah admin. Jika tidak, mengembalikan respons error.
    
    users = User.query.all() #Mengambil semua user dari database.
    return jsonify([user.to_profile_dict() for user in users]) #Mengonversi setiap user menjadi dictionary menggunakan metode to_profile_dict() dan mengembalikannya sebagai respons JSON.

# Endpoint untuk mengupload foto profil
@user_bp.route('/<int:user_id>/photo', methods=['POST']) # Rute untuk mengupload foto profil user tertentu berdasarkan user_id yang diberikan.
@jwt_required() # Memastikan bahwa hanya user yang telah terotentikasi yang dapat mengakses rute ini.
def upload_profile_photo(user_id): # Mendefinisikan fungsi untuk mengupload foto profil.
    try:
        current_user_id = int(get_jwt_identity()) # Mendapatkan ID user saat ini dari token JWT.
    except Exception:
        return jsonify({"error": "Invalid token identity."}), 401 # Jika terjadi kesalahan saat mendapatkan ID user, mengembalikan respons error.

    if user_id != current_user_id:
        return jsonify({"error": "Akses ditolak. Anda hanya dapat mengupload foto untuk akun Anda sendiri."}), 403 # Memeriksa apakah user yang akan mengupload foto adalah user saat ini. Jika tidak, mengembalikan respons error.

    if 'photo' not in request.files: 
        return jsonify({"error": "File foto tidak ditemukan pada request."}), 400 # Memeriksa apakah file foto ada dalam request. Jika tidak, mengembalikan respons error.

    file = request.files['photo'] # Mengambil file foto dari request.

    if file.filename == '':
        return jsonify({"error": "Nama file kosong."}), 400 # Memeriksa apakah nama file kosong. Jika ya, mengembalikan respons error.

    if not allowed_file(file.filename):
        return jsonify({"error": "Format file tidak didukung. Gunakan png/jpg/jpeg/gif."}), 400 # Memeriksa apakah file memiliki ekstensi yang diizinkan. Jika tidak, mengembalikan respons error.

    filename = secure_filename(f"{user_id}_{int(datetime.datetime.utcnow().timestamp())}_{file.filename}") # Membuat nama file yang aman dengan menambahkan user_id dan timestamp untuk menghindari konflik nama file.
    save_dir = os.path.join(current_app.root_path, 'static', 'foto_profile') # Direktori penyimpanan file foto profil
    os.makedirs(save_dir, exist_ok=True) # Membuat direktori jika belum ada
    save_path = os.path.join(save_dir, filename) # Path lengkap untuk menyimpan file

    try:
        file.save(save_path) # Menyimpan file ke direktori yang ditentukan
    except Exception as e:
        return jsonify({"error": f"Gagal menyimpan file sementara: {str(e)}"}), 500 # Jika penyimpanan file gagal, mengembalikan respons error.

    # Prepare URLs and paths
    relative_url = url_for('static', filename=f'foto_profile/{filename}') # URL relatif untuk mengakses foto profil
    absolute_url = f"http://localhost:5000{relative_url}" # URL absolut untuk mengakses foto profil

    user = User.query.get_or_404(user_id) # Mengambil user dari database berdasarkan user_id yang diberikan. Jika user tidak ditemukan, mengembalikan respons 404.
    old_url = user.profile_pic_url or '' # Simpan URL lama untuk dihapus nanti
    old_filename = None # Nama file lama untuk dihapus nanti
    if old_url and ('/foto_profile/' in old_url): #jika ada foto profil lama
        old_filename = old_url.split('/foto_profile/')[-1] # Ekstrak nama file lama dari URL

    try:
        user.profile_pic_url = absolute_url # Memperbarui URL foto profil user di database
        db.session.commit() # Menyimpan perubahan ke database

        if old_filename: # Hapus file foto profil lama jika ada
            try:
                old_path = os.path.join(current_app.root_path, 'static', 'foto_profile', old_filename) # Path lengkap file lama
                save_dir_norm = os.path.normpath(os.path.join(current_app.root_path, 'static', 'foto_profile')) # Normalisasi direktori penyimpanan
                old_path_norm = os.path.normpath(old_path) # Normalisasi path file lama
                if old_path_norm.startswith(save_dir_norm) and os.path.exists(old_path_norm) and old_path_norm != save_path: # Pastikan file lama ada di direktori yang benar dan bukan file yang baru diupload
                    os.remove(old_path_norm) # Hapus file lama
            except Exception:
                pass

        return jsonify({"message": "Foto profil berhasil diupload", "user": user.to_profile_dict()}), 200 # Mengembalikan respons sukses dengan pesan dan data profil user yang diperbarui.

    except Exception as e: # Menangani kesalahan saat memperbarui database
        try:
            if os.path.exists(save_path): # Hapus file yang baru diupload jika terjadi kesalahan
                os.remove(save_path) # Hapus file yang baru diupload jika terjadi kesalahan
        except Exception:
            pass
        db.session.rollback() # Mengembalikan sesi database jika terjadi kesalahan
        return jsonify({"error": f"Gagal memperbarui database: {str(e)}"}), 500 # Mengembalikan respons error server.

@user_bp.route('/<int:user_id>', methods=['GET']) #Rute untuk mendapatkan informasi user tertentu berdasarkan user_id yang diberikan.
@jwt_required() #Memastikan bahwa hanya user yang telah terotentikasi yang dapat mengakses rute ini.
def get_user(user_id): #Mendefinisikan fungsi untuk mendapatkan informasi user.
    try:
        current_user_id = int(get_jwt_identity()) #Mendapatkan ID user saat ini dari token JWT.
    except Exception: #Jika terjadi kesalahan saat mendapatkan ID user, mengembalikan respons error.
        return jsonify({"error": "Invalid token identity."}), 401

    user = User.query.get_or_404(user_id) #Mengambil user dari database berdasarkan user_id yang diberikan. Jika user tidak ditemukan, mengembalikan respons 404.
    print(f"[GET] User {user_id}, Current: {current_user_id}") #Mencetak informasi debug tentang user yang diminta dan user saat ini.

    if user.id != current_user_id and not is_admin(current_user_id): #Memeriksa apakah user yang diminta adalah user saat ini atau jika user saat ini adalah admin.
        return jsonify({"error": "Akses ditolak. Anda tidak berhak melihat profil ini."}), 403

    profile = user.to_profile_dict() #Mengonversi objek User menjadi dictionary menggunakan metode to_profile_dict().
    print(f"[GET] Returning profile: {profile}") #Mencetak informasi debug tentang profil yang akan dikembalikan.
    return jsonify(profile) #Mengembalikan profil user sebagai respons JSON.

@user_bp.route('/<int:user_id>', methods=['PUT', 'PATCH']) #Rute untuk memperbarui informasi user tertentu berdasarkan user_id yang diberikan.
@jwt_required() #Memastikan bahwa hanya user yang telah terotentikasi yang dapat mengakses rute ini.
def update_user(user_id): #Mendefinisiakn fungsi untuk memperbarui informasi user.
    try:
        current_user_id = int(get_jwt_identity()) #Mendapatkan ID user saat ini dari token JWT.
    except Exception:
        return jsonify({"error": "Invalid token identity."}), 401 #Jika terjadi kesalahan saat mendapatkan ID user, mengembalikan respons error.
    user = User.query.get_or_404(user_id) #Mengambil user dari database berdasarkan user_id yang diberikan. Jika user tidak ditemukan, mengembalikan respons 404.
    data = request.get_json() #Mengambil data JSON yang dikirim dalam permintaan untuk memperbarui informasi user.

    print(f"[UPDATE] User ID: {user_id}, Current User ID: {current_user_id}, Data: {data}") #Mencetak informasi debug tentang user yang akan diperbarui, ID user saat ini, dan data yang diterima.

    try:
        current_user = User.query.get(int(current_user_id)) #Mengambil objek User untuk user saat ini berdasarkan ID-nya.
    except Exception:
        current_user = None #Jika terjadi kesalahan, mengatur current_user ke None.

    is_current_admin = current_user and current_user.role == 'Admin' #Memeriksa apakah user saat ini adalah admin.

    if user.id != current_user_id and not is_current_admin: #Memeriksa apakah user yang akan diperbarui adalah user saat ini atau jika user saat ini adalah admin.
        print(f"[UPDATE] Authorization failed: not owner or admin") #Jika tidak, mencetak pesan debug dan mengembalikan respons error.
        return jsonify({"error": "Akses ditolak. Anda hanya dapat mengedit profil Anda sendiri atau memerlukan hak Admin."}), 403 #Mengembalikan respons error jika otorisasi gagal.

    try:
        # Basic editable fields allowed for owners
        user.full_name = data.get('full_name', user.full_name) # Memperbarui nama lengkap user jika disediakan dalam data.
        user.location = data.get('location', user.location) # Memperbarui lokasi user jika disediakan dalam data.

        if 'birth_date' in data: # Memperbarui tanggal lahir user jika disediakan dalam data.
            birth_date_str = data.get('birth_date') # Mendapatkan string tanggal lahir dari data.
            if birth_date_str == "" or birth_date_str is None: # Jika string kosong atau None, atur tanggal lahir ke None.
                user.birth_date = None # Menghapus tanggal lahir jika string kosong atau None.
            else:
                user.birth_date = datetime.datetime.strptime(birth_date_str, '%Y-%m-%d').date() # Mengonversi string ke objek date dan memperbarui tanggal lahir.

        if 'user_type' in data and data.get('user_type'): # Memperbarui tipe user jika disediakan dalam data.
            user.user_type = data.get('user_type') # Memperbarui tipe user jika disediakan dalam data.

        if is_current_admin: # Jika user saat ini adalah admin, izinkan perubahan tambahan.
            if 'role' in data and data.get('role') in ROLES: # Memperbarui Role user jika disediakan dalam data dan valid.
                user.role = data.get('role') # Memperbarui Role user jika disediakan dalam data dan valid.

            if 'email' in data and data.get('email') and data.get('email') != user.email: # Memperbarui email user jika disediakan dalam data dan berbeda dari email saat ini.
                if User.query.filter_by(email=data.get('email')).first(): 
                    return jsonify({"error": "Email sudah terdaftar"}), 409 # Memeriksa apakah email baru sudah terdaftar oleh user lain.
                user.email = data.get('email') # Memperbarui email user jika disediakan dalam data dan berbeda dari email saat ini.

            if 'password' in data and data.get('password'): # Memperbarui password user jika disediakan dalam data.
                user.set_password(data.get('password')) # Memperbarui password user jika disediakan dalam data.

        if (user.id == current_user_id) and ('password' in data) and data.get('password'): # Jika user memperbarui profilnya sendiri dan password disediakan dalam data.
            user.set_password(data.get('password')) # Memperbarui password user.

        print(f"[UPDATE] Before commit: full_name={user.full_name}, location={user.location}, birth_date={user.birth_date}, role={user.role}, email={user.email}") # Mencetak informasi debug sebelum commit.
        db.session.commit() # Menyimpan perubahan ke database.
        print(f"[UPDATE] Success!") # Mencetak pesan sukses setelah commit berhasil.

        return jsonify({ # Mengembalikan respons sukses dengan pesan dan data profil user yang diperbarui.
            "message": "Profil berhasil diperbarui", # Pesan sukses
            "user": user.to_profile_dict() # Data profil user yang diperbarui dalam format dictionary
        })
    
    except ValueError as e:
        print(f"[UPDATE] ValueError: {str(e)}") # Mencetak pesan debug jika terjadi ValueError (misalnya, format tanggal salah).
        db.session.rollback() # Mengembalikan sesi database jika terjadi kesalahan.
        return jsonify({"error": f"Format tanggal salah: {str(e)}"}), 422 # Mengembalikan respons error untuk format tanggal yang salah.

    except Exception as e:
        print(f"[UPDATE] Exception: {type(e).__name__}: {str(e)}") # Mencetak pesan debug untuk kesalahan umum lainnya.
        import traceback # Mencetak jejak tumpukan kesalahan untuk debugging.
        traceback.print_exc() 
        db.session.rollback() # Mengembalikan sesi database jika terjadi kesalahan.
        return jsonify({"error": f"Error: {str(e)}"}), 500 # Mengembalikan respons error server.

@user_bp.route('/<int:user_id>', methods=['DELETE']) #Rute untuk menghapus user tertentu berdasarkan user_id yang diberikan.
@jwt_required() #Memastikan bahwa hanya user yang telah terotentikasi yang dapat mengakses rute ini.
def delete_user(user_id): #Mendefinisikan fungsi untuk menghapus user.
    try:
        current_user_id = int(get_jwt_identity()) #Mendapatkan ID user saat ini dari token JWT.
    except Exception: #Jika terjadi kesalahan saat mendapatkan ID user, mengembalikan respons error.
        return jsonify({"error": "Invalid token identity."}), 401 #Jika terjadi kesalahan saat mendapatkan ID user, mengembalikan respons error.

    if not is_admin(current_user_id): #Memeriksa apakah user saat ini adalah admin.
        return jsonify({"error": "Akses ditolak. Diperlukan hak Admin."}), 403 #Jika user saat ini bukan admin, mengembalikan respons error.
    
    user = User.query.get_or_404(user_id) #Mengambil user dari database berdasarkan user_id yang diberikan. Jika user tidak ditemukan, mengembalikan respons 404.
    
    if user.id == current_user_id: 
        return jsonify({"error": "Admin tidak dapat menghapus akunnya sendiri melalui rute ini."}), 400 #Mencegah admin menghapus akunnya sendiri melalui rute ini.

    db.session.delete(user) #Menghapus user dari sesi database.
    db.session.commit() #Menyimpan perubahan ke database.
    return jsonify({"message": f"User dengan ID {user_id} berhasil dihapus."}), 200 #Mengembalikan respons sukses setelah user berhasil dihapus.