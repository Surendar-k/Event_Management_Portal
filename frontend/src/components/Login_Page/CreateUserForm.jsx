import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlusIcon,
  UsersIcon,
  TrashIcon
} from '@heroicons/react/24/solid';

const CreateUserForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('create');

  const [form, setForm] = useState({
    faculty_id: '',
    faculty_name: '',
    designation: '',
    department: '',
    institution_name: '',
    role: 'faculty',
    email: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
useEffect(() => {
  if (!user) return;

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        credentials: 'include'
      });
      const data = await res.json();

      // HODs can only see users from their department
      if (user.role === 'hod') {
        const filtered = data.filter(u => u.department === user.department);
        setUsers(filtered);
      } else {
        // CSO and Principal can see all
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  fetchUsers();
}, [user]);

 useEffect(() => {
  const fetchSession = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/session', {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.user && ['hod', 'cso', 'principal'].includes(data.user.role)) {
        setUser(data.user);
      } else {
        navigate('/unauthorized');
      }
    } catch {
      navigate('/login');
    }
  };

  fetchSession();
}, []);


  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    const creatorRole = user?.role;
    const creatorDept = user?.department;
    const formRole = form.role;
    const formDept = form.department;

    if (
      creatorRole === 'hod' &&
      formRole !== 'faculty'
    ) {
      return setError('HODs can only create faculty accounts.');
    }

    if (
      creatorRole === 'hod' &&
      formDept !== creatorDept
    ) {
      return setError(`As ${creatorDept} HOD, you can only add users to your department.`);
    }

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create user');
        return;
      }

      setMessage('✅ User created successfully!');
      setForm({
        faculty_id: '',
        faculty_name: '',
        designation: '',
        department: '',
        institution_name: '',
        role: 'faculty',
        email: ''
      });

      const refreshed = await fetch('http://localhost:5000/api/users', {
        credentials: 'include'
      });
      const allUsers = await refreshed.json();
      setUsers(allUsers);
    } catch (err) {
      setError('Server error: ' + err.message);
    }
  };

  const handleDelete = async faculty_id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${faculty_id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete user');
        return;
      }

      setUsers(users.filter(u => u.faculty_id !== faculty_id));
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  return (
    
  <div className="max-w-7xl mx-auto mt-12 px-6 py-10 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-200">
    <div className="mb-10 text-center">
      <h1 className="text-4xl font-bold text-blue-900 tracking-wider">
        ⚙️ User Management Panel
      </h1>
      {user && (
        <p className="mt-2 text-lg text-gray-700 font-medium">
          Logged in as <span className="text-blue-800 font-semibold">{user.faculty_name}</span> ({user.role})
        </p>
      )}
    </div>

    {/* Tabs */}
    <div className="flex justify-center mb-10 gap-6">
      <button
        onClick={() => setActiveTab('create')}
        className={`group flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition shadow-lg ${
          activeTab === 'create'
            ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'
        }`}
      >
        <UserPlusIcon className="h-5 w-5 group-hover:scale-110 transition" />
        Create User
      </button>
      <button
        onClick={() => setActiveTab('list')}
        className={`group flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition shadow-lg ${
          activeTab === 'list'
            ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'
        }`}
      >
        <UsersIcon className="h-5 w-5 group-hover:scale-110 transition" />
        View Users
      </button>
    </div>

    {activeTab === 'create' && (
      <>
        {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4 font-medium">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 text-lg">
          {/* Input fields */}
          {[
            ['faculty_id', 'Faculty ID', 'Enter faculty ID (e.g., 1001)'],
            ['faculty_name', 'Faculty Name', 'Enter full name'],
            ['designation', 'Designation', 'e.g., Assistant Professor'],
            ['department', 'Department', 'e.g., IT'],
            ['institution_name', 'Institution Name', 'e.g., K.S.R. Institutions'],
            ['email', 'Email', 'e.g., user@shanmugha.edu.in']
          ].map(([name, label, placeholder]) => (
            <div key={name}>
              <label className="block text-gray-800 font-semibold mb-1">{label}</label>
              <input
                type={name === 'email' ? 'email' : 'text'}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:bg-gray-100"
                disabled={name === 'department' && user?.role === 'hod'}
              />
            </div>
          ))}

          {/* Role dropdown */}
          <div>
            <label className="block text-gray-800 font-semibold mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:bg-gray-100"
              disabled={user?.role === 'hod'}
            >
              <option value="faculty">Faculty</option>
              {user?.role !== 'hod' && (
                <>
                  <option value="hod">HOD</option>
                  <option value="cso">CSO</option>
                  <option value="principal">Principal</option>
                </>
              )}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
          >
            🚀 Create User
          </button>
        </form>
      </>
    )}

    {/* User list */}
    {activeTab === 'list' && (
      <div className="overflow-x-auto mt-8">
        <table className="min-w-full text-base text-left border rounded-xl shadow-md bg-white">
          <thead className="bg-blue-100 text-blue-900 uppercase font-bold">
            <tr>
              {[
                'Faculty ID',
                'Name',
                'Designation',
                'Department',
                'Institution',
                'Email',
                'Role',
                'Actions'
              ].map(header => (
                <th key={header} className="px-4 py-3 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {users.map((u, idx) => (
              <tr key={u.faculty_id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
                <td className="px-4 py-3 border">{u.faculty_id}</td>
                <td className="px-4 py-3 border">{u.faculty_name}</td>
                <td className="px-4 py-3 border">{u.designation}</td>
                <td className="px-4 py-3 border">{u.department}</td>
                <td className="px-4 py-3 border">{u.institution_name}</td>
                <td className="px-4 py-3 border">{u.email}</td>
                <td className="px-4 py-3 border capitalize">{u.role}</td>
                <td className="px-4 py-3 border">
                  {u.faculty_id !== user?.faculty_id ? (
                    <button
                      onClick={() => handleDelete(u.faculty_id)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm shadow-sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">Self</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

};

export default CreateUserForm;
