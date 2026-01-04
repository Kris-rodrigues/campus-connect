import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import UploadModal from './UploadModal';
import EditNoteModal from './EditNoteModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subscribedStudents, setSubscribedStudents] = useState([]);
    const [notes, setNotes] = useState([]);
    const [quizResults, setQuizResults] = useState([]); 
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    
    // Default view based on role? We'll handle that in useEffect or render
    const [view, setView] = useState('students'); 
    const [message, setMessage] = useState('');

    const [studentForm, setStudentForm] = useState({
        name: '',
        usn: '',
        branch: '',
        dob: { day: '', month: '', year: '' }
    });

    const [teacherForm, setTeacherForm] = useState({
        name: '',
        branch: '',
        dob: { day: '', month: '', year: '' }
    });

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole'); // Get user role
    const isAdmin = userRole === 'admin'; // Check if super admin

    const fetchData = useCallback(async () => {
        try {
            // Fetch Students (Visible to both)
            const studentRes = await axios.get('/api/users', { headers: { 'x-auth-token': token } });
            setStudents(studentRes.data);
            
            // Fetch Notes (Visible to both)
            const noteRes = await axios.get('/api/notes', { headers: { 'x-auth-token': token } });
            setNotes(noteRes.data);

            // Fetch Leaderboard (Visible to both)
            const quizRes = await axios.get('/api/quiz/all-results', { headers: { 'x-auth-token': token } });
            setQuizResults(quizRes.data);

            // Fetch Admin-Only Data
            if (isAdmin) {
                const subRes = await axios.get('/api/users/subscribed', { headers: { 'x-auth-token': token } });
                setSubscribedStudents(subRes.data);

                try {
                    const teachRes = await axios.get('/api/users/teachers', { headers: { 'x-auth-token': token } });
                    setTeachers(teachRes.data);
                } catch (err) { console.log("Teachers fetch skipped"); }
            }

        } catch (error) {
            console.error("Failed to fetch data", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                 setMessage('Session expired.');
            }
        }
    }, [token, isAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ... (All Handlers: handleResetLeaderboard, handleAddStudent, handleAddTeacher, handleEditClick, handleDeleteClick... remain unchanged) ...
    const handleResetLeaderboard = async () => {
        if (window.confirm("⚠️ WARNING: This will delete ALL student quiz scores and badges permanently. Are you sure?")) {
            try {
                const res = await axios.delete('/api/quiz/reset', { headers: { 'x-auth-token': token } });
                alert(res.data.message);
                fetchData(); 
            } catch (err) { alert("Failed to reset leaderboard."); }
        }
    };

    const handleFormChange = (e) => setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
    const handleDobChange = (e) => { setStudentForm({ ...studentForm, dob: { ...studentForm.dob, [e.target.name]: e.target.value } }); };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        const { name, usn, branch, dob } = studentForm;
        if (!dob.day || !dob.month || !dob.year) return setMessage('Invalid DOB');
        const fullDateOfBirth = `${dob.year}-${dob.month}-${dob.day}`;

        try {
            setMessage('Adding student...'); 
            const res = await axios.post('/api/users/add', { name, usn, branch, dateOfBirth: fullDateOfBirth }, { headers: { 'x-auth-token': token } });
            setMessage(res.data.message);
            fetchData();
            setStudentForm({ name: '', usn: '', branch: '', dob: { day: '', month: '', year: '' } });
        } catch (err) { setMessage(err.response?.data?.message || 'Error adding student.'); }
    };

    const handleTeacherFormChange = (e) => setTeacherForm({ ...teacherForm, [e.target.name]: e.target.value });
    const handleTeacherDobChange = (e) => { setTeacherForm({ ...teacherForm, dob: { ...teacherForm.dob, [e.target.name]: e.target.value } }); };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        const { name, branch, dob } = teacherForm;
        if (!dob.day || !dob.month || !dob.year) return setMessage('Invalid DOB');
        const fullDateOfBirth = `${dob.year}-${dob.month}-${dob.day}`;

        try {
            setMessage('Adding teacher...'); 
            const res = await axios.post('/api/users/add-teacher', { name, branch, dateOfBirth: fullDateOfBirth }, { headers: { 'x-auth-token': token } });
            setMessage(res.data.message);
            fetchData();
            setTeacherForm({ name: '', branch: '', dob: { day: '', month: '', year: '' } });
        } catch (err) { setMessage(err.response?.data?.message || 'Error adding teacher.'); }
    };

    const handleEditClick = (note) => { setSelectedNote(note); setIsEditModalOpen(true); };
    const handleDeleteClick = async (noteId) => {
        if (window.confirm('Delete this note?')) {
            try {
                await axios.delete(`/api/notes/delete/${noteId}`, { headers: { 'x-auth-token': token } });
                fetchData();
            } catch (err) { console.error(err); }
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = [ { value: '01', name: 'January' }, { value: '02', name: 'February' }, { value: '03', name: 'March' }, { value: '04', name: 'April' }, { value: '05', name: 'May' }, { value: '06', name: 'June' }, { value: '07', name: 'July' }, { value: '08', name: 'August' }, { value: '09', name: 'September' }, { value: '10', name: 'October' }, { value: '11', name: 'November' }, { value: '12', name: 'December' } ];
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));


    return (
        <>
            <Navbar />
            {isUploadModalOpen && <UploadModal closeModal={() => setIsUploadModalOpen(false)} onUploadSuccess={fetchData} />}
            {isEditModalOpen && <EditNoteModal note={selectedNote} closeModal={() => setIsEditModalOpen(false)} onUpdateSuccess={fetchData} />}
            
            <div className="admin-container">
                <header className="page-header">
                    {/* Show Role in Title */}
                    <h1>{isAdmin ? 'Admin Dashboard' : 'Teacher Dashboard'}</h1>
                </header>

                <div className={`stats-grid ${isAdmin ? 'three-cols' : 'two-cols'}`}>
                    <div className="stat-card"><h2>{students.length}</h2><p>Total Students</p></div>
                    <div className="stat-card"><h2>{notes.length}</h2><p>Total Notes</p></div>
                    {/* Only Admin sees these stats */}
                    {isAdmin && (
                        <>
                            <div className="stat-card"><h2>{teachers.length}</h2><p>Total Teachers</p></div>
                            <div className="stat-card"><h2>{subscribedStudents.length}</h2><p>Total Subscriptions</p></div>
                        </>
                    )}
                </div>

                <div className="management-section">
                    <div className="management-tabs">
                        <button onClick={() => setView('students')} className={view === 'students' ? 'active' : ''}>Manage Students</button>
                        <button onClick={() => setView('notes')} className={view === 'notes' ? 'active' : ''}>Manage Notes</button>
                        
                        {/* Only Admin sees these tabs */}
                        {isAdmin && (
                            <>
                                <button onClick={() => setView('teachers')} className={view === 'teachers' ? 'active' : ''}>Manage Teachers</button>
                                <button onClick={() => setView('subscribed')} className={view === 'subscribed' ? 'active' : ''}>Subscribed Users</button>
                            </>
                        )}
                        
                        <button onClick={() => setView('leaderboard')} className={view === 'leaderboard' ? 'active' : ''}>Quiz Leaderboard</button>
                        <button className="upload-btn-main" onClick={() => setIsUploadModalOpen(true)}>Upload New Note</button>
                    </div>

                    {/* --- View Rendering Logic --- */}

                    {view === 'students' && (
                        <div className="management-content">
                            <div className="add-student-form">
                                <h3>Add New Student</h3>
                                <form onSubmit={handleAddStudent}>
                                    <input name="name" value={studentForm.name} onChange={handleFormChange} placeholder="Full Name" required />
                                    <input name="usn" value={studentForm.usn} onChange={handleFormChange} placeholder="USN" required />
                                    <input name="branch" value={studentForm.branch} onChange={handleFormChange} placeholder="Branch" required />
                                    <label>Date of Birth</label>
                                    <div className="dob-select-container">
                                        <select name="day" value={studentForm.dob.day} onChange={handleDobChange} required> <option value="" disabled>Day</option> {days.map(d => <option key={d} value={d}>{d}</option>)} </select>
                                        <select name="month" value={studentForm.dob.month} onChange={handleDobChange} required> <option value="" disabled>Month</option> {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)} </select>
                                        <select name="year" value={studentForm.dob.year} onChange={handleDobChange} required> <option value="" disabled>Year</option> {years.map(y => <option key={y} value={y}>{y}</option>)} </select>
                                    </div>
                                    <button type="submit">Add Student</button>
                                </form>
                                {message && <p className="status-message">{message}</p>}
                            </div>
                            <div className="student-list">
                                <h3>All Students</h3>
                                <table>
                                    <thead><tr><th>Name</th><th>USN</th><th>Branch</th></tr></thead>
                                    <tbody>
                                        {students.length > 0 ? (
                                            students.map(s => <tr key={s._id}><td>{s.name}</td><td>{s.usn}</td><td>{s.branch}</td></tr>)
                                        ) : ( <tr><td colSpan="3" style={{ textAlign: 'center' }}>No students added yet.</td></tr> )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {isAdmin && view === 'teachers' && (
                        <div className="management-content">
                             <div className="add-student-form">
                                <h3>Add New Teacher</h3>
                                <form onSubmit={handleAddTeacher}>
                                    <input name="name" value={teacherForm.name} onChange={handleTeacherFormChange} placeholder="Full Name" required />
                                    <input name="branch" value={teacherForm.branch} onChange={handleTeacherFormChange} placeholder="Branch" required />
                                    <label>Date of Birth</label>
                                    <div className="dob-select-container">
                                        <select name="day" value={teacherForm.dob.day} onChange={handleTeacherDobChange} required> <option value="" disabled>Day</option> {days.map(d => <option key={d} value={d}>{d}</option>)} </select>
                                        <select name="month" value={teacherForm.dob.month} onChange={handleTeacherDobChange} required> <option value="" disabled>Month</option> {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)} </select>
                                        <select name="year" value={teacherForm.dob.year} onChange={handleTeacherDobChange} required> <option value="" disabled>Year</option> {years.map(y => <option key={y} value={y}>{y}</option>)} </select>
                                    </div>
                                    <button type="submit">Add Teacher</button>
                                </form>
                                {message && <p className="status-message">{message}</p>}
                            </div>
                            <div className="student-list">
                                <h3>All Teachers</h3>
                                <table>
                                    <thead><tr><th>Name</th><th>Branch</th></tr></thead>
                                    <tbody>
                                        {teachers.length > 0 ? (
                                            teachers.map(t => <tr key={t._id}><td>{t.name}</td><td>{t.branch}</td></tr>)
                                        ) : ( <tr><td colSpan="2" style={{ textAlign: 'center' }}>No teachers added yet.</td></tr> )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {isAdmin && view === 'subscribed' && (
                        <div className="subscribed-users-list">
                            <h3>Subscribed Users</h3>
                            <table>
                                <thead><tr><th>Name</th><th>USN</th><th>Branch</th></tr></thead>
                                <tbody>
                                    {subscribedStudents.length > 0 ? (
                                        subscribedStudents.map(s => <tr key={s._id}><td>{s.name}</td><td>{s.usn}</td><td>{s.branch}</td></tr>)
                                    ) : ( <tr><td colSpan="3" style={{ textAlign: 'center' }}>No subscribed users found.</td></tr> )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'notes' && (
                        <div className="notes-management-list">
                            <h3>All Uploaded Notes</h3>
                            <table>
                                <thead>
                                    <tr><th>Title</th><th>Subject</th><th>Branch</th><th>Semester</th><th>Module</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {notes.length > 0 ? (
                                        notes.map(n => (
                                            <tr key={n._id}>
                                                <td>{n.title}</td><td>{n.subject}</td><td>{n.branch}</td><td>{n.semester}</td><td>{n.module}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="edit-btn" onClick={() => handleEditClick(n)}>✏️ Edit</button>
                                                        <button className="delete-btn" onClick={() => handleDeleteClick(n._id)}>🗑️ Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : ( <tr><td colSpan="6" style={{ textAlign: 'center' }}>No notes uploaded yet.</td></tr> )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'leaderboard' && (
                        <div className="notes-management-list">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                                <h3 style={{margin:0}}>Quiz Results</h3>
                                <button onClick={handleResetLeaderboard} className="reset-btn">⚠️ Reset Leaderboard</button>
                            </div>
                            <table>
                                <thead><tr><th>Rank</th><th>Student Name</th><th>USN</th><th>Topic</th><th>Score</th><th>Badge</th></tr></thead>
                                <tbody>
                                    {quizResults.length > 0 ? (
                                        quizResults.map((res, index) => (
                                            <tr key={res._id}>
                                                <td>#{index + 1}</td>
                                                <td>{res.user ? res.user.name : 'Unknown'}</td>
                                                <td>{res.user ? res.user.usn : 'N/A'}</td>
                                                <td>{res.topicName}</td>
                                                <td style={{fontWeight:'bold', color:'#81c995'}}>{res.score}/{res.totalQuestions}</td>
                                                <td>{res.badge}</td>
                                            </tr>
                                        ))
                                    ) : ( <tr><td colSpan="6" style={{textAlign:'center'}}>No results found.</td></tr> )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
export default AdminDashboard;