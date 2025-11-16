import React, { memo } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaEnvelope, FaBookOpen, FaUser } from 'react-icons/fa';

const dummyVocabs = [
    { id: 1, text: 'A', video: 'link-video-a.mp4' }, { id: 2, text: 'B', video: 'link-video-b.mp4' },
    { id: 3, text: 'C', video: 'link-video-c.mp4' }, { id: 4, text: 'D', video: 'link-video-d.mp4' },
    { id: 5, text: 'E', video: 'link-video-e.mp4' }, { id: 6, text: 'F', video: 'link-video-f.mp4' },
    { id: 7, text: 'G', video: 'link-video-g.mp4' }, { id: 8, text: 'H', video: 'link-video-h.mp4' },
    { id: 9, text: 'I', video: 'link-video-i.mp4' }, { id: 10, text: 'J', video: 'link-video-j.mp4' },
    { id: 11, text: 'K', video: 'link-video-k.mp4' }, { id: 12, text: 'L', video: 'link-video-l.mp4' },
    { id: 13, text: 'M', video: 'link-video-m.mp4' }, { id: 14, text: 'N', video: 'link-video-n.mp4' },
    { id: 15, text: 'O', video: 'link-video-o.mp4' }, { id: 16, text: 'P', video: 'link-video-p.mp4' },
    { id: 17, text: 'Q', video: 'link-video-q.mp4' }, { id: 18, text: 'R', video: 'link-video-r.mp4' },
    { id: 19, text: 'S', video: 'link-video-s.mp4' }, { id: 20, text: 'T', video: 'link-video-t.mp4' },
    { id: 21, text: 'U', video: 'link-video-u.mp4' }, { id: 22, text: 'V', video: 'link-video-v.mp4' },
    { id: 23, text: 'W', video: 'link-video-w.mp4' }, { id: 24, text: 'X', video: 'link-video-x.mp4' },
    { id: 25, text: 'Y', video: 'link-video-y.mp4' }, { id: 26, text: 'Z', video: 'link-video-z.mp4' },
];

const dummyAdmins = [
    { id: 1, name: 'Moh. Syaeful Effendi', email: 'mohsyaefuleffendi@student.uns.ac.id' },
    { id: 2, name: 'Admin Kedua', email: 'admin.kedua@gmail.com' },
];

const dummyFeedbacks = [
    { id: 1, user: 'Raafi', feedback: 'Bisakah menambahkan kata "Hallo"' },
    { id: 2, user: 'Ramadhani', feedback: 'Fitur penerjemah isyarat sangat membantu.' },
];

const DashboardSummary = memo(({ usersCount = 0, feedbacksCount = dummyFeedbacks.length }) => (
    <Container fluid className="p-0">
        <h1 className="main-title">Dashboard</h1>
        <Row className="mb-4">
            <Col md={6} lg={3} className="mb-4">
                <Card className="summary-card text-white bg-success">
                    <Card.Body>
                        <FaUsers size={30} className="card-icon" />
                        <h5 className="mb-0">Total Pengguna</h5>
                        <h2 className="card-text">{usersCount}</h2>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
                <Card className="summary-card text-white bg-warning">
                    <Card.Body>
                        <FaBookOpen size={30} className="card-icon" />
                        <h5 className="mb-0">Total Kosakata</h5>
                        <h2 className="card-text">{dummyVocabs.length}</h2>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
                <Card className="summary-card text-white bg-danger">
                    <Card.Body>
                        <FaEnvelope size={30} className="card-icon" />
                        <h5 className="mb-0">Umpan Balik</h5>
                        <h2 className="card-text">{feedbacksCount}</h2>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
                <Card className="summary-card text-white bg-primary">
                    <Card.Body>
                        <FaUser size={30} className="card-icon" />
                        <h5 className="mb-0">Total Admin</h5>
                        <h2 className="card-text">{dummyAdmins.length}</h2>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
        <Row>
            <Col md={12} className="mb-4">
                <Card className="stisla-card">
                    <Card.Body>
                        <Card.Title>Aktivitas Terkini</Card.Title>
                        <ul className="list-unstyled">
                            {dummyFeedbacks.map((item, index) => (
                                <li key={index} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="user-avatar me-3"></div>
                                        <div>
                                            <h6 className="mb-0">{item.user}</h6>
                                            <p className="text-muted mb-0">{item.feedback}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
));

DashboardSummary.displayName = 'DashboardSummary';

export default DashboardSummary;
