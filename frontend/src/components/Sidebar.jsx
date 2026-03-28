import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Clemson paw logo as SVG
function PawIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <ellipse cx="50" cy="65" rx="22" ry="18" />
      <ellipse cx="28" cy="45" rx="10" ry="13" transform="rotate(-20 28 45)" />
      <ellipse cx="72" cy="45" rx="10" ry="13" transform="rotate(20 72 45)" />
      <ellipse cx="42" cy="35" rx="8" ry="11" transform="rotate(-10 42 35)" />
      <ellipse cx="58" cy="35" rx="8" ry="11" transform="rotate(10 58 35)" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const { t } = useTranslation()
  const isDashboard = location.pathname === '/dashboard'
  const isSettings = location.pathname === '/settings'

  return (
    <aside className="w-16 flex flex-col items-center bg-sidebar text-white flex-shrink-0 h-full">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center justify-center w-full py-4 bg-accent hover:bg-purple-800 transition-colors">
        <PawIcon />
      </Link>

      {/* User profile */}
      <div className="flex flex-col items-center gap-1 py-3 w-full px-2 cursor-pointer hover:bg-sidebar-hover transition-colors">
        <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
          <UserIcon />
        </div>
        <span className="text-xs text-gray-300 leading-none">{t('nav.account')}</span>
      </div>

      {/* Divider */}
      <div className="w-10 border-t border-gray-600 my-1" />

      {/* Dashboard link */}
      <Link
        to="/dashboard"
        className={`flex flex-col items-center gap-1 py-3 w-full px-2 transition-colors ${
          isDashboard ? 'bg-sidebar-hover text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
        }`}
      >
        <DashboardIcon />
        <span className="text-xs leading-none">{t('nav.dashboard')}</span>
      </Link>

      {/* Settings — pinned to bottom */}
      <Link
        to="/settings"
        className={`flex flex-col items-center gap-1 py-3 w-full px-2 transition-colors mt-auto ${
          isSettings ? 'bg-sidebar-hover text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
        }`}
      >
        <SettingsIcon />
        <span className="text-xs leading-none">{t('nav.settings')}</span>
      </Link>
    </aside>
  )
}
