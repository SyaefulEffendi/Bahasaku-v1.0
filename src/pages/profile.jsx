import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Image, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { 
    FaUser, FaEnvelope, FaHome, FaBirthdayCake, FaInfoCircle, 
    FaCamera, FaEdit, FaLock, FaSave, FaTimes, FaArrowLeft,
    FaTachometerAlt
} from 'react-icons/fa'; 
import './css/profile.css'; 
import { useAuth } from '../context';  
import { useNavigate } from 'react-router-dom';

// Fungsi ini HANYA akan mengembalikan format YYYY-MM-DD atau string kosong
const convertToYYYYMMDD = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') {
        return '';
    }

    const yyyy_mm_dd_regex = /^\d{4}-\d{2}-\d{2}/;
    if (yyyy_mm_dd_regex.test(dateStr)) {
        return dateStr.split('T')[0];
    }

    const dd_mm_yyyy_regex = /^(\d{2})\/(\d{2})\/(\d{4})/;
    const match = dateStr.match(dd_mm_yyyy_regex);
    
    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return '';
};


const Profile = () => {
    const { user, token, login } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    
    const [formValues, setFormValues] = useState(null); 
    
    // State khusus untuk form ganti password
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // State pesan error/sukses khusus modal password
    const [passError, setPassError] = useState(null);
    const [passSuccess, setPassSuccess] = useState(null);

    useEffect(() => {
        if (user) {
            // Convert profile_pic_url to absolute URL if it's relative
            let pic_url = user.profile_pic_url || '';
            if (pic_url && !pic_url.startsWith('http') && !pic_url.startsWith('data:')) {
                pic_url = `http://localhost:5000${pic_url}`;
            }
            setFormValues({
                full_name: user.full_name || '',
                email: user.email || '',
                user_type: user.user_type || '',
                location: user.location || '',
                birth_date: convertToYYYYMMDD(user.birth_date),
                profile_pic_url: pic_url
            });
        }
    }, [user]);

    const handleEditToggle = () => {
        if (isEditing) {
            setFormValues({
                full_name: user.full_name,
                email: user.email,
                user_type: user.user_type,
                location: user.location,
                birth_date: convertToYYYYMMDD(user.birth_date),
                profile_pic_url: user.profile_pic_url
            });
            setError(null); 
            setSuccess(null); 
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    // Handler untuk input password
    const handlePasswordInput = (e) => {
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        if (!user || !user.id) {
            setError('User ID tidak ditemukan. Silakan login ulang.');
            setIsLoading(false);
            return;
        }

        if (!token) {
            setError('Token tidak ditemukan. Silakan login ulang.');
            setIsLoading(false);
            return;
        }

        const dataToSubmit = {
            full_name: formValues.full_name,
            location: formValues.location,
            birth_date: formValues.birth_date || null
        };

        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(dataToSubmit)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal menyimpan.');
            }

            const duration = localStorage.getItem('loginDuration') || (24 * 60 * 60 * 1000);
            const rememberMe = parseInt(duration) > (24 * 60 * 60 * 1000);
            login(data.user, token, rememberMe); 

            setIsEditing(false);
            setSuccess('Profil berhasil diperbarui!');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
                setError('Format file tidak didukung. Gunakan PNG, JPG, atau GIF.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { 
                setError('Ukuran file terlalu besar (maksimal 5MB).');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview({
                    file: file,
                    preview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmPhoto = async () => {
        if (!photoPreview) return;
        await uploadProfilePhoto(photoPreview.file);
        setPhotoPreview(null);
    };

    const handleCancelPhoto = () => {
        setPhotoPreview(null);
        setError(null);
    };

    const uploadProfilePhoto = async (file) => {
        if (!user || !user.id || !token) {
            setError('User ID atau token tidak ditemukan. Silakan login ulang.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.id}/photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengupload foto.');
            }

            const duration = localStorage.getItem('loginDuration') || (24 * 60 * 60 * 1000);
            const rememberMe = parseInt(duration) > (24 * 60 * 60 * 1000);
            login(data.user, token, rememberMe);

            setFormValues({
                full_name: data.user.full_name,
                email: data.user.email,
                user_type: data.user.user_type,
                location: data.user.location,
                birth_date: convertToYYYYMMDD(data.user.birth_date),
                profile_pic_url: data.user.profile_pic_url
            });

            setShowPhotoModal(false);
            setSuccess('Foto profil berhasil diupload!');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // === FITUR GANTI PASSWORD ===
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPassError(null);
        setPassSuccess(null);
        setIsLoading(true);

        // 1. Validasi Input Lokal
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPassError("Konfirmasi password baru tidak cocok.");
            setIsLoading(false);
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPassError("Password baru minimal 6 karakter.");
            setIsLoading(false);
            return;
        }

        try {
            // 2. Panggil API Backend
            const response = await fetch(`http://localhost:5000/api/users/${user.id}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: passwordForm.oldPassword,
                    new_password: passwordForm.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengganti password.');
            }

            // 3. Sukses
            setPassSuccess("Password berhasil diganti!");
            // Reset form
            setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Tutup modal setelah 2 detik
            setTimeout(() => {
                setShowPasswordModal(false);
                setPassSuccess(null);
            }, 2000);

        } catch (err) {
            setPassError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset state modal password saat ditutup
    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPassError(null);
        setPassSuccess(null);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };


    if (!user || !formValues) {
        return (
            <div className="profile-background" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="profile-background">
            <Container className="py-5">
                <Row className="justify-content-center">
                    {/* --- Kolom Kiri (Profil Pic & Tombol) --- */}
                    <Col lg={4} xl={3} className="mb-4 mb-lg-0">
                        <Card className="profile-sidebar-card text-center shadow">
                            <Card.Body>
                                <div className="profile-pic-wrapper mx-auto mb-3">
                                    <Image src={formValues.profile_pic_url} roundedCircle className="profile-pic" />
                                    <Button
                                        className="edit-pic-btn shadow-sm"
                                        onClick={() => setShowPhotoModal(true)}
                                    >
                                        <FaCamera />
                                    </Button>
                                </div>
                                <h5>{formValues.full_name}</h5>
                                <p className="text-muted">{formValues.email}</p>

                                {user.role === 'Admin' && (
                                    <Button 
                                        variant="primary" 
                                        className="mt-4 w-100" 
                                        onClick={() => navigate('/dashboard-admin')}
                                    >
                                        <FaTachometerAlt className="me-2" /> Dashboard Admin
                                    </Button>
                                )}

                                <Button 
                                    variant="outline-primary" 
                                    className="w-100"
                                    style={{ marginTop: user.role === 'Admin' ? '0.5rem' : '1.5rem' }}
                                    onClick={() => navigate('/')}
                                >
                                    <FaArrowLeft className="me-2" /> Kembali
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* --- Kolom Kanan (Form Detail) --- */}
                    <Col lg={8} xl={9}>
                        <Card className="profile-details-card shadow">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="mb-0">Profil Pengguna</h4>
                                    {isEditing ? (
                                        <div>
                                            <Button variant="success" onClick={handleSave} className="me-2" disabled={isLoading}>
                                                {isLoading ? <Spinner as="span" animation="border" size="sm" /> : <FaSave className="me-2" />} Simpan
                                            </Button>
                                            <Button variant="secondary" onClick={handleEditToggle} disabled={isLoading}>
                                                <FaTimes className="me-2" /> Batal
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="primary" onClick={handleEditToggle}>
                                            <FaEdit className="me-2" /> Edit Profil
                                        </Button>
                                    )}
                                </div>

                                {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">{success}</Alert>}

                                <Form onSubmit={handleSave}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formFullName">
                                                <Form.Label>Nama Lengkap</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text><FaUser /></InputGroup.Text>
                                                    <Form.Control type="text" name="full_name" value={formValues.full_name} onChange={handleChange} disabled={!isEditing} />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formEmail">
                                                <Form.Label>Alamat Email</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                                                    <Form.Control type="email" name="email" value={formValues.email} disabled />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formUserType">
                                                <Form.Label>Tipe Pengguna</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text><FaInfoCircle /></InputGroup.Text>
                                                    <Form.Control type="text" name="user_type" value={formValues.user_type} onChange={handleChange} disabled />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="formBirthdate">
                                                <Form.Label>Tanggal Lahir</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text><FaBirthdayCake /></InputGroup.Text>
                                                    <Form.Control type="date" name="birth_date" value={formValues.birth_date} onChange={handleChange} disabled={!isEditing} />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                        
                                        <Col md={12}>
                                            <Form.Group className="mb-4" controlId="formLocation">
                                                <Form.Label>Lokasi (Tempat Tinggal)</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text><FaHome /></InputGroup.Text>
                                                    <Form.Control type="text" name="location" value={formValues.location} onChange={handleChange} disabled={!isEditing} />
                                                </InputGroup>
                                            </Form.Group> 
                                        </Col>
                                    </Row>
                                    
                                    <hr />
                                    <Button variant="outline-danger" onClick={() => setShowPasswordModal(true)}>
                                        <FaLock className="me-2" /> Ganti Password
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal Ganti Foto */}
            <Modal centered show={showPhotoModal} onHide={() => setShowPhotoModal(false)} size="sm">
                <Modal.Header closeButton>
                    <Modal.Title>Ganti Foto Profil</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!photoPreview ? (
                        <>
                            <p>Pilih foto terbaik Anda. Ukuran file disarankan di bawah 5MB.</p>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Control 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handlePhotoChange}
                                    disabled={isLoading}
                                />
                            </Form.Group>
                        </>
                    ) : (
                        <>
                            <p className="mb-3">Pratinjau foto profil Anda:</p>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <Image 
                                    src={photoPreview.preview} 
                                    roundedCircle 
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                            </div>
                            <p className="text-muted text-center small">{photoPreview.file.name}</p>
                        </>
                    )}
                    {error && <Alert variant="danger" className="mb-0">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    {!photoPreview ? (
                        <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
                            Tutup
                        </Button>
                    ) : (
                        <>
                            <Button 
                                variant="secondary" 
                                onClick={handleCancelPhoto}
                                disabled={isLoading}
                            >
                                Ganti Foto
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleConfirmPhoto}
                                disabled={isLoading}
                            >
                                {isLoading ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : null}
                                Konfirmasi
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
            
            {/* Modal Ganti Password - DIPERBARUI */}
            <Modal centered show={showPasswordModal} onHide={closePasswordModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Ganti Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {passError && <Alert variant="danger">{passError}</Alert>}
                    {passSuccess && <Alert variant="success">{passSuccess}</Alert>}
                    
                    <Form onSubmit={handlePasswordChange}>
                        <Form.Group className="mb-3" controlId="formOldPassword">
                            <Form.Label>Password Lama</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="oldPassword"
                                placeholder="Masukkan password lama" 
                                value={passwordForm.oldPassword}
                                onChange={handlePasswordInput}
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formNewPassword">
                            <Form.Label>Password Baru</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="newPassword"
                                placeholder="Minimal 6 karakter" 
                                value={passwordForm.newPassword}
                                onChange={handlePasswordInput}
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formConfirmPassword">
                            <Form.Label>Konfirmasi Password Baru</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="confirmPassword"
                                placeholder="Ketik ulang password baru" 
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordInput}
                                required 
                            />
                        </Form.Group>
                        <div className="d-grid">
                            <Button variant="primary" type="submit" disabled={isLoading}>
                                {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Simpan Password'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Profile;