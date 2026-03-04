import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CoursePage from './pages/CoursePage'
import FileViewerPage from './pages/FileViewerPage'
import StudyBuddyPage from './pages/StudyBuddyPage'
import LectureListPage from './pages/LectureListPage'
import LecturePage from './pages/LecturePage'
import MCQPage from './pages/MCQPage'
import FlashcardsPage from './pages/FlashcardsPage'
import ScoreHistoryPage from './pages/ScoreHistoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/course/:courseId/studybuddy" element={<StudyBuddyPage />} />
            {/* Lecture learning hub — must come before the generic :fileType catch-all */}
            <Route path="/course/:courseId/lectures" element={<LectureListPage />} />
            <Route path="/course/:courseId/lectures/:filename/flashcards" element={<FlashcardsPage />} />
            <Route path="/course/:courseId/lectures/:filename/history" element={<ScoreHistoryPage />} />
            <Route path="/course/:courseId/lectures/:filename/mcq" element={<MCQPage />} />
            <Route path="/course/:courseId/lectures/:filename" element={<LecturePage />} />
            {/* Assignments and any other file types still use the file viewer */}
            <Route path="/course/:courseId/:fileType" element={<FileViewerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
