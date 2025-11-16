import React, { useMemo, memo } from 'react';
import { Container, Table, Button, Form } from 'react-bootstrap';
import SearchInput from './SearchInput';

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

const ManageVocabulary = memo(({ searchTerm, setSearchTerm }) => {
    const filteredVocabs = useMemo(() => {
        return dummyVocabs.filter(vocab =>
            vocab.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <Container fluid className="p-0">
            <h2 className="main-title">Kelola Data Kosakata</h2>
            <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Cari kosakata..." />
            <Form className="mb-4">
                <Form.Group controlId="formText" className="mb-3">
                    <Form.Label>Kosakata Teks</Form.Label>
                    <Form.Control type="text" placeholder="Masukkan teks" />
                </Form.Group>
                <Form.Group controlId="formVideo" className="mb-3">
                    <Form.Label>Video Kosakata</Form.Label>
                    <Form.Control type="file" />
                </Form.Group>
                <Button variant="primary">Tambah Kosakata</Button>
            </Form>
            <Table key="vocabs-table" striped bordered hover responsive>
                <thead>
                    <tr><th>#</th><th>Kosakata</th><th>Video</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                    {filteredVocabs.map((vocab) => (
                        <tr key={vocab.id}>
                            <td>{vocab.id}</td>
                            <td>{vocab.text}</td>
                            <td><a href={vocab.video} target="_blank" rel="noopener noreferrer">Lihat Video</a></td>
                            <td>
                                <Button variant="warning" size="sm" className="me-2">Edit</Button>
                                <Button variant="danger" size="sm">Hapus</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
});

ManageVocabulary.displayName = 'ManageVocabulary';

export default ManageVocabulary;
