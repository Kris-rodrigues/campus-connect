import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import NoteCard from './NoteCard';
import ViewPdfModal from './ViewPdfModal';
import EditNoteModal from './EditNoteModal';
import AiModal from './AiModal';
import SubscriptionModal from './SubscriptionModal';
import ChatModal from './ChatModal';
import TestModal from './TestModal';
import './StudyMaterialsPage.css'; 

const branches = [
    { name: 'Artificial Intelligence & Machine Learning', key: 'AIML' },
    { name: 'Computer Science & Engineering', key: 'CSE' },
    { name: 'Mechanical Engineering', key: 'MECH' },
    { name: 'Electronics & Communication Engineering', key: 'ECE' },
    { name: 'Electrical & Electronics Engineering', key: 'EEE' },
    { name: 'Civil Engineering', key: 'CIVIL' },
    { name: 'Computer Science and Business Systems', key: 'CSBS' },
];
const semesters = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`);
const modules = ['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'];

const StudyMaterialsPage = () => {
    // Navigation state
    const [view, setView] = useState('branch');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);

    // Data state
    const [subjects, setSubjects] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Modal states
    const [fileToView, setFileToView] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    
    // AI/Test Modals
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiMode, setAiMode] = useState('');
    const [aiContent, setAiContent] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [quizData, setQuizData] = useState(null);
    
    // --- FIX 1: Add missing state ---
    const [noteIdForAI, setNoteIdForAI] = useState(null);
    const [quizTopicName, setQuizTopicName] = useState('');
    // --------------------------------

    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [noteIdForChat, setNoteIdForChat] = useState(null);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);

    // User info
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin' || userRole === 'teacher';
    const isSubscribed = localStorage.getItem('isSubscribed') === 'true';

    const fetchCurrentNotes = useCallback(async (moduleToFetch) => {
        if (!selectedBranch || !selectedSemester || !selectedSubject || !moduleToFetch) return;
        setLoading(true); setError('');
        try {
            const params = {
                branch: selectedBranch.name,
                semester: selectedSemester,
                subject: selectedSubject,
                module: moduleToFetch
            };
            const res = await axios.get('/api/notes/filter', { headers: { 'x-auth-token': token }, params });
            setNotes(res.data);
        } catch (err) {
            setError('Notes are not available for this category at the moment.');
            setNotes([]);
        } finally {
            setLoading(false);
        }
    }, [token, selectedBranch, selectedSemester, selectedSubject]);

    const handleBranchClick = (branch) => { setSelectedBranch(branch); setView('semester'); };
    const handleSemesterClick = async (semester) => {
         setSelectedSemester(semester); setView('subject'); setLoading(true); setError('');
         try {
             const res = await axios.get('/api/notes/subjects', { headers: { 'x-auth-token': token }, params: { branch: selectedBranch.name, semester } });
             setSubjects(res.data);
         } catch (err) { setError('Could not fetch subjects.'); setSubjects([]); }
         finally { setLoading(false); }
    };
    const handleSubjectClick = (subject) => { setSelectedSubject(subject); setView('module'); };
    const handleModuleClick = (module) => { setSelectedModule(module); setView('notes'); fetchCurrentNotes(module); };

    // --- AI Feature Handler ---
    const handleAiFeature = async (noteId, mode) => {
        setNoteIdForAI(noteId);
        setAiMode(mode);
        setAiLoading(true);
        setAiContent('');
        setIsAiModalOpen(true); 

        // --- FIX 2: Set Quiz Topic ---
        if (mode === 'quiz') {
            setQuizTopicName(selectedSubject || "General Quiz");
        }
        // -----------------------------

        let url = '';
        if (mode === 'summary') url = `/api/ai/summarize/${noteId}`;
        else if (mode === 'quiz') url = `/api/ai/quiz/${noteId}`;
        else { setIsAiModalOpen(false); return; }

        try {
            const res = await axios.post(url, {}, { headers: { 'x-auth-token': token } });
            
            if (mode === 'quiz') {
                setQuizData(res.data.quiz);
                setIsAiModalOpen(false); 
                setIsTestModalOpen(true);
            } else {
                if (mode === 'summary') setAiContent(res.data.summary);
            }
        } catch (err) {
            setAiContent(err.response?.data?.message || `Could not generate ${mode}.`);
        } finally {
            setAiLoading(false);
        }
    };
    
    const handleSummarize = (noteId) => handleAiFeature(noteId, 'summary');
    const handleQuiz = (noteId) => handleAiFeature(noteId, 'quiz');
    const handleChat = (noteId) => { setNoteIdForChat(noteId); setIsChatModalOpen(true); };
    const handleEditClick = (note) => { setSelectedNote(note); setIsEditModalOpen(true); };
    const handleDeleteClick = async (noteId) => {
        if (window.confirm('Delete this note?')) {
            try {
                await axios.delete(`/api/notes/delete/${noteId}`, { headers: { 'x-auth-token': token } });
                fetchCurrentNotes(selectedModule);
            } catch (err) { setError("Failed to delete note."); }
        }
    };
    
    const handlePaywall = () => setIsPaywallOpen(true);
    const handleViewFile = (noteId) => setFileToView(noteId);

    const resetTo = (v) => {
        setView(v);
        if(v === 'branch') { setSelectedBranch(null); setSelectedSemester(null); setSelectedSubject(null); setSelectedModule(null); }
        if(v === 'semester') { setSelectedSemester(null); setSelectedSubject(null); setSelectedModule(null); }
        if(v === 'subject') { setSelectedSubject(null); setSelectedModule(null); }
        if(v === 'module') { setSelectedModule(null); }
        setNotes([]); setSubjects([]);
    };

    const UpgradeCard = () => (
        <div className="upgrade-card">
            <h3>🚀 Unlock All Features</h3>
            <p>Get full PDF access and AI-powered study tools by upgrading to Pro.</p>
            <button className="upgrade-btn" onClick={handlePaywall}>
                Upgrade Now
            </button>
        </div>
    );

    return (
        <>
            <Navbar />
            {fileToView && <ViewPdfModal noteId={fileToView} closeModal={() => setFileToView(null)} />}
            {isAdmin && isEditModalOpen && <EditNoteModal note={selectedNote} closeModal={() => setIsEditModalOpen(false)} onUpdateSuccess={() => fetchCurrentNotes(selectedModule)} />}
            {isAiModalOpen && <AiModal mode={aiMode} content={aiContent} isLoading={aiLoading} closeModal={() => setIsAiModalOpen(false)} />}
            
            {/* --- FIX 3: Pass noteId and topicName to TestModal --- */}
            {isTestModalOpen && quizData && 
                <TestModal 
                    quizData={quizData} 
                    noteId={noteIdForAI}
                    topicName={quizTopicName}
                    closeModal={() => setIsTestModalOpen(false)} 
                />
            }
            
            {isPaywallOpen && <SubscriptionModal closeModal={() => setIsPaywallOpen(false)} />}
            {isChatModalOpen && <ChatModal noteId={noteIdForChat} closeModal={() => setIsChatModalOpen(false)} />}
            
            <div className="study-materials-container">
                <header className="page-header">
                     <h1>
                        {view === 'branch' && 'Browse by Branch'}
                        {view === 'semester' && selectedBranch?.name}
                        {view === 'subject' && `${selectedBranch?.name} - ${selectedSemester}`}
                        {view === 'module' && `${selectedSemester} - ${selectedSubject}`}
                        {view === 'notes' && `${selectedSubject} - ${selectedModule}`}
                    </h1>
                    {view === 'semester' && <button className="back-btn" onClick={() => resetTo('branch')}>← Back to Branches</button>}
                    {view === 'subject' && <button className="back-btn" onClick={() => resetTo('semester')}>← Back to Semesters</button>}
                    {view === 'module' && <button className="back-btn" onClick={() => resetTo('subject')}>← Back to Subjects</button>}
                    {view === 'notes' && <button className="back-btn" onClick={() => resetTo('module')}>← Back to Modules</button>}
                </header>

                {view === 'branch' && <div className="branch-grid">{branches.map(b => <div key={b.key} className="branch-card" onClick={() => handleBranchClick(b)}><h3>{b.name}</h3></div>)}</div>}
                {view === 'semester' && <div className="semester-list">{semesters.map(s => <div key={s} className="semester-card" onClick={() => handleSemesterClick(s)}><h4>{s}</h4></div>)}</div>}
                {view === 'subject' && <div className="subject-list">{loading ? <p>Loading...</p> : subjects.length === 0 ? <p>No subjects found.</p> : subjects.map(s => <div key={s} className="subject-card" onClick={() => handleSubjectClick(s)}><h4>{s}</h4></div>)}</div>}
                {view === 'module' && <div className="module-list">{modules.map(m => <div key={m} className="module-card" onClick={() => handleModuleClick(m)}><h4>{m}</h4></div>)}</div>}
                
                {view === 'notes' && (
                     <div className="notes-list-view">
                        {loading ? <p>Loading...</p> : error ? <p className='error'>{error}</p> : notes.length === 0 ? <p>No notes found.</p> : (
                            <div className="notes-grid">
                                {!isAdmin && !isSubscribed && <UpgradeCard />}
                                {notes.map(note => (
                                    <NoteCard
                                        key={note._id}
                                        note={note}
                                        onViewFile={handleViewFile}
                                        isAdmin={isAdmin}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                        onSummarize={handleSummarize}
                                        onQuiz={handleQuiz}
                                        onChat={handleChat}
                                        onPaywall={handlePaywall}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default StudyMaterialsPage;