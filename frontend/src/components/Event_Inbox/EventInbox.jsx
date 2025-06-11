import {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

const EventInbox = () => {
  const navigate = useNavigate()

  // Replace this logic with your actual user role retrieval
  const userRole = localStorage.getItem('userRole') // e.g. "faculty" or other roles

  useEffect(() => {
    if (!userRole) {
      // If userRole is missing, maybe redirect to login or error page
      navigate('/login')
      return
    }

    if (userRole === 'faculty') {
      navigate('/faculty-inbox')
    } else {
      navigate('/higher-authority-inbox')
    }
  }, [userRole, navigate])

  // Show loading or fallback UI while redirecting
  return (
    <div style={{padding: 20, textAlign: 'center'}}>
      <h2>Loading Inbox...</h2>
    </div>
  )
}

export default EventInbox
