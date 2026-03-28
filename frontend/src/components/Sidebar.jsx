import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

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

export default function Sidebar() {
  const location = useLocation()
  const { t } = useTranslation()
  const isDashboard = location.pathname === '/dashboard'

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

      {/* Language switcher — always visible */}
      <div className="mt-auto py-3">
        <LanguageSwitcher variant="compact" />
      </div>
    </aside>
  )
}
