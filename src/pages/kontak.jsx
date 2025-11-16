import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import './css/kotak.css';

import bgImage from './Image/background-header.svg fill.png';
import dotsLeft from './Image/kontak-kiri-atas.png';
import shapeRight from './Image/kontak-kanan-atas.png';
import shapeLeft from './Image/kontak-kiri-bawah.png';


function Kontak() {
    const [dataForm, setDataForm] = useState({
        namaLengkap: '',
        alamatEmail: '',
        pesan: ''
    });
    const [popUpKonfirmasi, setPopUp] = useState(false);

    const Perubahan = (e) => {
        const { name, value } = e.target;
        setDataForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const Submit = (e) => {
        e.preventDefault();
        if (dataForm.namaLengkap && dataForm.alamatEmail && dataForm.pesan) {
            setPopUp(true);
        } else {
            alert("Harap isi semua kolom yang wajib diisi.");
        }
    };

    const TutupPopUp = () => {
        setPopUp(false);
    };


    return (
        <div>
            <title>Kontak</title>
            <Navbar />
            <main>
                <div className="kontak-hero-banner">
                    <img
                        src={bgImage}
                        alt="Dekorasi latar belakang"
                        className="hero-banner-bg-image"
                    />
                    <h1 className="hero-banner-title">Kontak</h1>
                </div>
                
                <section className="form-section">
                    <img src={dotsLeft} alt="Dekorasi titik" className="dots-left-form" />
                    <img src={shapeRight} alt="Dekorasi bentuk kanan" className="shape-right-form" />
                    <img src={shapeLeft} alt="Dekorasi bentuk kiri" className="shape-left-form" />
                    
                    <div className="form-container">
                        <form onSubmit={Submit}>
                            <div className="form-group">
                                <label htmlFor="namaLengkap">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    id="namaLengkap"
                                    name="namaLengkap"
                                    value={dataForm.namaLengkap}
                                    onChange={Perubahan}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="alamatEmail">Alamat Email *</label>
                                <input
                                    type="email"
                                    id="alamatEmail"
                                    name="alamatEmail"
                                    value={dataForm.alamatEmail}
                                    onChange={Perubahan}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pesan">Pesan *</label>
                                <textarea
                                    id="pesan"
                                    name="pesan"
                                    rows="5"
                                    value={dataForm.pesan}
                                    onChange={Perubahan}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="kirim-btn">Kirim</button>
                        </form>
                    </div>
                </section>

                {/* --- BAGIAN POP-UP YANG SUDAH DISEMPURNAKAN --- */}
                {popUpKonfirmasi && (
                    <div className="popup-overlay" onClick={TutupPopUp}>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Konfirmasi Data</h2>
                            <p><strong>Nama Lengkap:</strong> {dataForm.namaLengkap}</p>
                            <p><strong>Alamat Email:</strong> {dataForm.alamatEmail}</p>
                            <p><strong>Pesan:</strong> {dataForm.pesan}</p>
                            
                            <div className="popup-actions">
                                <button onClick={TutupPopUp} className="popup-edit-btn">
                                    Perbaiki
                                </button>
                                <button onClick={TutupPopUp} className="popup-confirm-btn">
                                    Sudah Betul
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default Kontak;