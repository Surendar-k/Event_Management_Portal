import { useState } from 'react'
import { useNavigate } from 'react-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import ksrLogo from '../../assets/ksr-logo.png'

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
    <div className='flex min-h-screen items-center justify-center bg-[#575757] px-4 py-8'>
      <div className='w-full max-w-xl rounded-xl bg-[#ddd] p-10 shadow-xl'>
        {/* Branding */}
        <div className='mb-6 flex flex-col items-center'>
          <img src={ksrLogo} alt='KSR Logo' className='mb-3 h-20 w-20' />
          <h1 className='text-center text-3xl font-bold text-[#333]'>
            K.S.R. Educational Institution
          </h1>
          <p className='text-center text-sm text-[#575757]'>
            Faculty & Admin Login Portal
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className='mb-4 rounded-md bg-red-100 px-4 py-2 text-center font-medium text-red-600'>
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className='space-y-5'>
          <div>
            <label
              htmlFor='email'
              className='mb-1 block text-sm font-medium text-[#575757]'
            >
              Institutional Email
            </label>
            <input
              id='email'
              type='email'
              className='w-full rounded-lg border border-[#ccc] bg-white px-4 py-3 text-[#333] placeholder-[#aaa] focus:ring-2 focus:ring-[#aaa] focus:outline-none'
              placeholder='you@shanmugha.edu.in'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete='email'
            />
          </div>

          <div className='relative'>
            <label
              htmlFor='password'
              className='mb-1 block text-sm font-medium text-[#575757]'
            >
              Password
            </label>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              className='w-full rounded-lg border border-[#ccc] bg-white px-4 py-3 text-[#333] placeholder-[#aaa] focus:ring-2 focus:ring-[#aaa] focus:outline-none'
              placeholder='••••••••'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete='current-password'
            />
            <button
              type='button'
              onClick={() => setShowPassword(prev => !prev)}
              className='absolute top-12 right-3 -translate-y-1/2 transform text-[#575757] hover:text-[#333]'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </button>
          </div>

          <button
            type='submit'
            className='w-full rounded-lg bg-[#333] py-3 text-lg font-semibold text-white transition duration-200 hover:bg-[#222]'
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className='mt-6 text-center text-sm text-[#aaa]'>
          &copy; {new Date().getFullYear()} K.S.R. Institutions. All rights
          reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
