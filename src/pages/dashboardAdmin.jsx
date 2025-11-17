import React, { useState, useEffect } from 'react';
import { Nav, Button } from 'react-bootstrap';
import { FaUsers, FaEnvelope, FaBookOpen, FaUserShield, FaSignOutAlt, FaCog, FaBars, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import './css/dashboardAdmin.css';
import logoBahasaku from './Image/logo-tittle-copy-0.png';

// Import komponen-komponen terpisah
import DashboardSummary from './dashboardAdmin/DashboardSummary';
import ManageUsers from './dashboardAdmin/ManageUsers';
import ManageVocabulary from './dashboardAdmin/ManageVocabulary';
import ManageAdmins from './dashboardAdmin/ManageAdmins';
import ViewFeedback from './dashboardAdmin/ViewFeedback';

// Konstanta API
const API_BASE_URL = 'http://localhost:5000/api';

const DashboardAdmin = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState('summary');
    const [searchTerm, setSearchTerm] = useState('');
    const [usersCount, setUsersCount] = useState(0);
    // submenu opens on click; use state to toggle visibility
    const [usersOpen, setUsersOpen] = useState(false);

    // Fetch total users count
    useEffect(() => {
        const fetchUsersCount = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/users/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsersCount(data.length);
                }
            } catch (err) {
                console.error('Error fetching users count:', err);
            }
        };

        fetchUsersCount();
    }, []);

    const handleToggle = () => setSidebarOpen(!sidebarOpen);

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
        setSearchTerm('');
        // close submenu when navigating to a page
        setUsersOpen(false);
        if (window.innerWidth < 992) {
            setSidebarOpen(false);
        }
    };

    const renderContent = () => {
        switch (activeMenu) {
            case 'users': return <ManageUsers searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
            case 'vocabulary': return <ManageVocabulary searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
            case 'admins': return <ManageAdmins searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
            case 'feedback': return <ViewFeedback />;
            default: return <DashboardSummary usersCount={usersCount} />;
        }
    };

    return (
        <div className="d-flex stisla-dashboard">
            <title>Dashboard Admin</title>
            <div className={`sidebar text-white ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header d-flex align-items-center p-4">
                    <img src={logoBahasaku} alt="Bahasaku Logo" className="sidebar-logo" />
                    <h5 className="mb-0 text-white">Bahasaku</h5>
                    <Button variant="danger" className="d-lg-none ms-auto" onClick={handleToggle}><FaTimes size={20} /></Button>
                </div>
                <Nav className="flex-column p-4">
                    <Nav.Link onClick={() => handleMenuClick('summary')} className={`nav-link-stisla ${activeMenu === 'summary' ? 'active' : ''}`}><FaCog className="me-2" /> Dashboard</Nav.Link>

                    {/* Combined Kelola User + Kelola Admin dropdown */}
                    <div className={`nav-item user-admin-dropdown ${usersOpen ? 'show' : ''}`}>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setUsersOpen(!usersOpen)}
                            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setUsersOpen(!usersOpen); }}
                            className={`nav-link-stisla d-flex justify-content-between align-items-center ${(activeMenu === 'users' || activeMenu === 'admins') ? 'active' : ''}`}
                        >
                            <span><FaUsers className="me-2" /> Kelola User</span>
                            <span>{usersOpen ? <FaChevronDown /> : <FaChevronRight />}</span>
                        </div>

                        <div className="submenu mt-2">
                            <Nav.Link onClick={() => handleMenuClick('users')} className={`nav-link-stisla ${activeMenu === 'users' ? 'active' : ''}`}>Kelola User</Nav.Link>
                            <Nav.Link onClick={() => handleMenuClick('admins')} className={`nav-link-stisla ${activeMenu === 'admins' ? 'active' : ''}`}>Kelola Admin</Nav.Link>
                        </div>
                    </div>

                    <Nav.Link onClick={() => handleMenuClick('vocabulary')} className={`nav-link-stisla ${activeMenu === 'vocabulary' ? 'active' : ''}`}><FaBookOpen className="me-2" /> Kelola Kosakata</Nav.Link>

                    {/* removed separate Kelola Admin item - merged into the dropdown above */}

                    <Nav.Link onClick={() => handleMenuClick('feedback')} className={`nav-link-stisla ${activeMenu === 'feedback' ? 'active' : ''}`}><FaEnvelope className="me-2" /> Umpan Balik</Nav.Link>
                </Nav>
                <a href="/">
                    <div className="mt-auto p-4"><Button variant="outline-light" className="w-100"><FaSignOutAlt className="me-2" /> Keluar dari Dashboard Admin</Button></div>
                </a>
            </div>

            <div className={`main-content flex-grow-1 p-0 ${sidebarOpen ? '' : 'shifted'}`}>
                <div className="top-navbar bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
                    <Button variant="light" className="d-lg-none" onClick={handleToggle}><FaBars size={20} /></Button>
                    <h5 className="mb-0 ms-auto">Hi, Admin!</h5>
                    <div className="user-profile ms-3"><div className="user-avatar"></div></div>
                </div>
                <div className="main-content-inner p-4">{renderContent()}</div>
            </div>
        </div>
    );
};

export default DashboardAdmin;