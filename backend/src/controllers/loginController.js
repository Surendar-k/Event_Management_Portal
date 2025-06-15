const db = require('../config/db')

exports.login = async (req, res) => {
  const {email, password} = req.body
  if (!email || !password)
    return res.status(400).json({error: 'Email and password required'})

  try {
    const [rows] = await db.query('SELECT * FROM login_users WHERE email = ?', [
      email
    ])
    if (rows.length === 0)
      return res.status(401).json({error: 'User not found'})

    const user = rows[0]
    const expectedPassword = `${user.faculty_name.toLowerCase()}@${user.faculty_id}`

    if (password !== expectedPassword) {
      return res.status(401).json({error: 'Invalid password'})
    }

    // Save user info in session
    req.session.user = {
      faculty_id: user.faculty_id,
      faculty_name: user.faculty_name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      department: user.department,
      institution_name: user.institution_name
    }

    res.json({
      message: 'Login successful',
      user: req.session.user
    })
  } catch (err) {
    res.status(500).json({error: err.message})
  }
}

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({error: 'Failed to logout'})
    }
    res.clearCookie('connect.sid') // clear cookie on client
    res.json({message: 'Logout successful'})
  })
}

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM login_users')
    res.json(rows)
  } catch (err) {
    res.status(500).json({error: err.message})
  }
}

exports.createUser = async (req, res) => {
  const {
    faculty_id,
    faculty_name,
    designation,
    department,
    institution_name,
    role,
    email
  } = req.body
  if (
    !faculty_id ||
    !faculty_name ||
    !designation ||
    !department ||
    !institution_name ||
    !role ||
    !email
  ) {
    return res.status(400).json({error: 'Please provide all fields'})
  }

  try {
    await db.query(
      'INSERT INTO login_users (faculty_id, faculty_name, designation, department, institution_name, role, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        faculty_id,
        faculty_name,
        designation,
        department,
        institution_name,
        role,
        email
      ]
    )
    res.json({message: 'User created', id: faculty_id})
  } catch (err) {
    res.status(500).json({error: err.message})
  }
}

exports.session = (req, res) => {
  if (req.session.user) {
    res.json({user: req.session.user})
  } else {
    res.status(401).json({error: 'Not logged in'})
  }
}
