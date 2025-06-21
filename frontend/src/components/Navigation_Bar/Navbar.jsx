import {useState, useEffect, useRef} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import ksrLogo from '../../assets/ksr-logo.png'
import axios from 'axios'

axios.defaults.withCredentials = true

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.pathname)
  const [showProfile, setShowProfile] = useState(false)
  const [user, setUser] = useState(null)
  const profileRef = useRef()

  const email = localStorage.getItem('email')
  const role = localStorage.getItem('role')

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout')
      localStorage.clear()
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  const handleNavigate = path => {
    setActiveTab(path)
    navigate(path)
  }

  const toggleProfile = async () => {
    if (!showProfile) {
      try {
        const res = await axios.get('http://localhost:5000/api/session')
        setUser(res.data.user)
        setShowProfile(true)
      } catch (err) {
        console.error('Failed to fetch session user:', err)
      }
    } else {
      setShowProfile(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

 

  const isHigherAuthority = ['hod', 'principal', 'cso'].includes(
    role?.toLowerCase()
  )

  const navLinks = [
    {label: 'Create Event', path: '/create-event'},
    {label: 'Report Generation', path: '/report-generation'},
    {label: 'Event Logs', path: '/event-logs'},
    ...(isHigherAuthority
    ? [{ label: 'Create User', path: '/create-user' }]
    : []),
      {
      label: 'Inbox',
      path: isHigherAuthority ? '/higherauthority-inbox' : '/faculty-inbox'
    },
  ]
return (
  <nav className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/10 backdrop-blur-md px-8 py-5 text-white shadow-2xl border-b border-white/20">
    {/* Logo + Title */}
    <div className="mb-4 flex items-center gap-4 sm:mb-0">
      <img src={ksrLogo} alt="sri shanmugha educational institutions Logo" className="h-14 w-14 rounded-full shadow-md" />
      <div>
        <h1 className="text-2xl font-extrabold tracking-wide text-white drop-shadow-md">
          Sri Shanmugha Educational Institutions
        </h1>
        <p className="text-sm text-blue-200 font-light">Faculty & Admin Panel</p>
      </div>
    </div>

    {/* Navigation Links */}
    <ul className="flex flex-wrap justify-center gap-5 text-lg font-medium sm:justify-start">
      {navLinks.map(({ label, path }) => (
        <li key={path}>
          <button
            onClick={() => handleNavigate(path)}
            className={`rounded-lg px-4 py-2 transition duration-300 ease-in-out ${
              activeTab === path
                ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg scale-105'
                : 'text-white hover:text-orange-300 hover:scale-105 hover:shadow-md'
            }`}
          >
            {label}
          </button>
        </li>
      ))}
    </ul>

    {/* Profile + Logout */}
    <div className="relative mt-5 flex items-center gap-4 sm:mt-0">
      <div className="text-right leading-tight hidden sm:block">
        <p className="text-sm font-semibold text-white">{email}</p>
        <p className="text-xs text-orange-200 capitalize">{role}</p>
      </div>

      <div
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-lg font-bold text-white uppercase shadow-md hover:scale-110 transition"
        onClick={toggleProfile}
      >
        {email?.charAt(0)}
      </div>

      {showProfile && user && (
        <div
          ref={profileRef}
          className="absolute top-16 right-2 z-50 w-72 rounded-xl border border-white/20 bg-white/90 backdrop-blur-md p-5 text-gray-800 shadow-2xl"
        >
          <h2 className="mb-4 text-lg font-bold text-gray-900 border-b border-gray-300 pb-2">
            👤 Profile Info
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            {[
              { label: 'Name', value: user.faculty_name },
              { label: 'Designation', value: user.designation },
              { label: 'Department', value: user.department },
              { label: 'Institution', value: user.institution_name },
              { label: 'Faculty ID', value: user.faculty_id }
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-wrap items-center gap-2 rounded-md bg-white/60 px-3 py-2 text-gray-900 shadow-sm"
              >
                <span className="w-28 font-semibold text-orange-700">{label}:</span>
                <span className="break-words text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="ml-2 rounded-md bg-gradient-to-br from-red-600 to-red-800 px-4 py-2 text-sm font-semibold text-white shadow-md hover:scale-105 transition"
      >
        Logout
      </button>
    </div>
  </nav>
);

}

export default Navbar
