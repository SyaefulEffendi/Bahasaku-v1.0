import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { FaVideo, FaFileUpload } from 'react-icons/fa';
import './css/video-to-text.css';

function VideoToText() {
    const [translation, setTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCameraClick = () => {
        setIsLoading(true);
        setTranslation('Memulai kamera...');
        setTimeout(() => {
            setTranslation('Ini adalah terjemahan dari video yang terlihat di kamera.');
            setIsLoading(false);
        }, 3000);
    };


    return (
        <div>
            <title>Video to Text</title>
            <Navbar />
            <main className="video-to-text-main">
                <Container className="my-5">
                    <Row className="justify-content-center">
                        <Col md={10}>
                            <Card className="shadow-sm">
                                <Card.Header className="text-center">
                                    <h2 className="my-2">Penerjemah Video ke Teks</h2>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="video-section text-center mb-4">
                                        <div className="video-placeholder">
                                            {/* Placeholder untuk video stream */}
                                            <FaVideo size={80} className="text-muted" />
                                            <p className="mt-3 text-muted">Video dari kamera atau galeri akan muncul di sini</p>
                                        </div>
                                    </div>
                                    <div className="button-section d-flex justify-content-center gap-3 mb-4">
                                        <Button variant="primary" onClick={handleCameraClick} disabled={isLoading}>
                                            {isLoading ? <Spinner animation="border" size="sm" className="me-2" /> : <FaVideo className="me-2" />}
                                            Buka Kamera
                                        </Button>
                                    </div>
                                    <hr />
                                    <div className="translation-section mt-4">
                                        <h4 className="text-center">Terjemahan Teks:</h4>
                                        <Card className="bg-light p-3 mt-3">
                                            {isLoading ? (
                                                <div className="text-center">
                                                    <Spinner animation="border" className="me-2" />
                                                    <span>Sedang menerjemahkan...</span>
                                                </div>
                                            ) : (
                                                <p className="mb-0">{translation || 'Terjemahan akan muncul di sini.'}</p>
                                            )}
                                        </Card>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </main>
            <Footer />
        </div>
    );
}

export default VideoToText;