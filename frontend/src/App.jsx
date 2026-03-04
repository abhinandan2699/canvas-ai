import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CoursePage from './pages/CoursePage'
import FileViewerPage from './pages/FileViewerPage'
import StudyBuddyPage from './pages/StudyBuddyPage'

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
            <Route path="/course/:courseId/:fileType" element={<FileViewerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
