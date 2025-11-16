import React, { useMemo, memo } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import SearchInput from './SearchInput';

const dummyAdmins = [
    { id: 1, name: 'Moh. Syaeful Effendi', email: 'mohsyaefuleffendi@student.uns.ac.id' },
    { id: 2, name: 'Admin Kedua', email: 'admin.kedua@gmail.com' },
];

const ManageAdmins = memo(({ searchTerm, setSearchTerm }) => {
    const filteredAdmins = useMemo(() => {
        return dummyAdmins.filter(admin =>
            admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <Container fluid className="p-0">
            <h2 className="main-title">Kelola Data Admin</h2>
            <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Cari admin..." />
            <Table key="admins-table" striped bordered hover responsive>
                <thead>
                    <tr><th>#</th><th>Nama</th><th>Email</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                    {filteredAdmins.map((admin) => (
                        <tr key={admin.id}>
                            <td>{admin.id}</td>
                            <td>{admin.name}</td>
                            <td>{admin.email}</td>
                            <td>
                                <Button variant="warning" size="sm" className="me-2">Edit</Button>
                                <Button variant="danger" size="sm">Hapus</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button variant="primary" className="mt-3"><FaPlus className="me-2" /> Tambah Admin</Button>
        </Container>
    );
});

ManageAdmins.displayName = 'ManageAdmins';

export default ManageAdmins;
