import React, { memo } from 'react';
import { Container, Table, Button } from 'react-bootstrap';

const dummyFeedbacks = [
    { id: 1, user: 'Raafi', feedback: 'Bisakah menambahkan kata "Hallo"' },
    { id: 2, user: 'Ramadhani', feedback: 'Fitur penerjemah isyarat sangat membantu.' },
];

const ViewFeedback = memo(() => (
    <Container fluid className="p-0">
        <h2 className="main-title">Umpan Balik Pengguna</h2>
        <Table key="feedback-table" striped bordered hover responsive>
            <thead>
                <tr><th>#</th><th>Pengguna</th><th>Umpan Balik</th><th>Aksi</th></tr>
            </thead>
            <tbody>
                {dummyFeedbacks.map((feedback) => (
                    <tr key={feedback.id}>
                        <td>{feedback.id}</td>
                        <td>{feedback.user}</td>
                        <td>{feedback.feedback}</td>
                        <td><Button variant="danger" size="sm">Hapus</Button></td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </Container>
));

ViewFeedback.displayName = 'ViewFeedback';

export default ViewFeedback;
