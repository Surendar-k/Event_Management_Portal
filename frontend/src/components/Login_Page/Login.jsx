import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {FaEye, FaEyeSlash} from 'react-icons/fa'
import logo from '../../assets/logo.jpg'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async e => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        credentials: 'include', // IMPORTANT: include cookies in request
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      })

      if (!response.ok) {
        const err = await response.json()
        setError(err.error || 'Login failed')
        return
      }

      const data = await response.json()

      // Optionally save minimal user info to localStorage/sessionStorage if needed
      localStorage.setItem('email', data.user.email)
      localStorage.setItem('role', data.user.role)

      // Redirect to protected route after login
      navigate('/create-event')
    } catch (err) {
      setError('Server error: ' + err.message)
    }
  }

  return (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-4 py-8">
    <div className="w-full max-w-xl rounded-3xl bg-white/10 backdrop-blur-lg p-10 shadow-2xl border border-white/20 transition-all duration-300">
      
      {/* Branding */}
      <div className="mb-8 flex flex-col items-center text-white">
        <img src={logo} alt="Sri Shanmugha Educational Institution Logo" className="mb-4 h-20 w-20 rounded-full shadow-lg" />
        <h1 className="text-3xl font-bold tracking-wide text-center">SRI SHANMUGHA EDUCATIONAL INSTITUTIONS</h1>
        <p className="text-sm text-gray-300">Faculty & Admin Login Portal</p>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mb-4 rounded-md bg-red-600/20 px-4 py-2 text-center font-medium text-red-200">
          {error}
        </p>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
            Institutional Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition"
            placeholder="you@shanmugha.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-10 right-4 text-gray-300 hover:text-white transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 text-lg font-semibold text-white shadow-md transition duration-300 hover:bg-blue-700 hover:shadow-xl"
        >
          🚀 Sign In
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Sri Shanmugha Educational Institutions. All rights reserved.
      </p>
    </div>
  </div>
);

}

export default Login
