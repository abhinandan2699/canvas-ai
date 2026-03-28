import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import SettingsPage from './pages/SettingsPage'
import Dashboard from './pages/Dashboard'
import CoursePage from './pages/CoursePage'
import FileViewerPage from './pages/FileViewerPage'
import StudyBuddyPage from './pages/StudyBuddyPage'
import LectureListPage from './pages/LectureListPage'
import LecturePage from './pages/LecturePage'
import MCQPage from './pages/MCQPage'
import FlashcardsPage from './pages/FlashcardsPage'
import ScoreHistoryPage from './pages/ScoreHistoryPage'
import LearningMapPage from './pages/LearningMapPage'
import AssignmentListPage from './pages/AssignmentListPage'
import AssignmentPage from './pages/AssignmentPage'
import AssignmentChatPage from './pages/AssignmentChatPage'
import AssignmentViewPage from './pages/AssignmentViewPage'
import LectureViewPage from './pages/LectureViewPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route path="/course/:courseId/studybuddy" element={<StudyBuddyPage />} />
            {/* Lecture learning hub — must come before the generic :fileType catch-all */}
            <Route path="/course/:courseId/lectures" element={<LectureListPage />} />
            <Route path="/course/:courseId/lectures/:filename/view" element={<LectureViewPage />} />
            <Route path="/course/:courseId/lectures/:filename/flashcards" element={<FlashcardsPage />} />
            <Route path="/course/:courseId/lectures/:filename/map" element={<LearningMapPage />} />
            <Route path="/course/:courseId/lectures/:filename/history" element={<ScoreHistoryPage />} />
            <Route path="/course/:courseId/lectures/:filename/mcq" element={<MCQPage />} />
            <Route path="/course/:courseId/lectures/:filename" element={<LecturePage />} />
            {/* Assignment hub — must come before the generic :fileType catch-all */}
            <Route path="/course/:courseId/assignments" element={<AssignmentListPage />} />
            <Route path="/course/:courseId/assignments/:filename/view" element={<AssignmentViewPage />} />
            <Route path="/course/:courseId/assignments/:filename/chat" element={<AssignmentChatPage />} />
            <Route path="/course/:courseId/assignments/:filename" element={<AssignmentPage />} />
            {/* Other file types fallback */}
            <Route path="/course/:courseId/:fileType" element={<FileViewerPage />} />
          </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
