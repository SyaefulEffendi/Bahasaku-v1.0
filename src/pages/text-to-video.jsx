import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { FaPlayCircle, FaFileUpload, FaKeyboard } from 'react-icons/fa';
import './css/text-to-video.css';
import signLanguageVideo from './Video/A.mp4'; // Pastikan path ini benar

function TextToVideo() {
    const [showModal, setShowModal] = useState(true); // Tampilkan modal di awal
    const [inputText, setInputText] = useState('');
    const [videoSrc, setVideoSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTextSubmit = (e) => {
        e.preventDefault();
        setShowModal(false);
        setIsLoading(true);

        setTimeout(() => {
            setVideoSrc(signLanguageVideo);
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div>
            <title>Text to Video</title>
            <Navbar />
            <main className="text-to-video-main">
                <Container className="my-5">
                    <Row className="justify-content-center">
                        <Col md={10}>
                            <Card className="shadow-sm">
                                <Card.Header className="text-center">
                                    <h2 className="my-2">Penerjemah Teks ke Video</h2>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="video-section text-center mb-4">
                                        {isLoading ? (
                                            <div className="video-placeholder d-flex flex-column align-items-center justify-content-center">
                                                <Spinner animation="border" className="mb-3" />
                                                <p>Sedang membuat video dari teks...</p>
                                            </div>
                                        ) : videoSrc ? (
                                            <div className="video-wrapper">
                                                <video controls autoPlay loop muted className="translated-video">
                                                    <source src={videoSrc} type="video/mp4" />
                                                    Browser Anda tidak mendukung tag video.
                                                </video>
                                            </div>
                                        ) : (
                                            <div className="video-placeholder">
                                                <FaPlayCircle size={80} className="text-muted" />
                                                <p className="mt-3 text-muted">Video terjemahan akan muncul di sini</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <Button variant="primary" onClick={() => setShowModal(true)}>
                                            <FaKeyboard className="me-2" /> Masukkan Teks
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </main>
            <Footer />

            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Masukkan Teks</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleTextSubmit}>
                        <Form.Group controlId="formTextarea">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Ketik teks yang ingin Anda terjemahkan..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                        </Form.Group>
                        <div className="d-grid gap-2 mt-3">
                            <Button variant="primary" type="submit">
                                Terjemahkan
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default TextToVideo;