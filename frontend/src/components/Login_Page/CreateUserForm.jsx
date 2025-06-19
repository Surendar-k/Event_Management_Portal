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
    <div className="max-w-7xl mx-auto mt-10 p-8 bg-gradient-to-b from-blue-50 via-white to-white rounded-3xl shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-800 tracking-wide">
          👨‍🏫 User Management Panel
        </h1>
        {user && (
          <p className="mt-2 text-lg text-gray-600">
            Logged in as <strong>{user.faculty_name}</strong> ({user.role})
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 gap-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-medium shadow-md transition ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <UserPlusIcon className="h-5 w-5" />
          Create User
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-medium shadow-md transition ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <UsersIcon className="h-5 w-5" />
          View Users
        </button>
      </div>

      {/* Create Form */}
      {activeTab === 'create' && (
        <>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          {message && <p className="text-green-600 text-center mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-5 text-lg">
            {[
              ['faculty_id', 'Faculty ID', 'Enter faculty ID (e.g., 1001)'],
              ['faculty_name', 'Faculty Name', 'Enter full name'],
              ['designation', 'Designation', 'e.g., Assistant Professor'],
              ['department', 'Department', 'e.g., IT'],
              ['institution_name', 'Institution Name', 'e.g., K.S.R. Institutions'],
              ['email', 'Email', 'e.g., user@shanmugha.edu.in']
            ].map(([name, label, placeholder]) => (
              <div key={name}>
                <label className="block text-gray-800 font-medium mb-1">{label}</label>
                <input
                  type={name === 'email' ? 'email' : 'text'}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  disabled={
                    name === 'department' && user?.role === 'hod'
                      ? true
                      : false
                  }
                />
              </div>
            ))}

            <div>
              <label className="block text-gray-800 font-medium mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
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
              className="w-full bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold py-3 rounded-xl transition"
            >
              🚀 Create User
            </button>
          </form>
        </>
      )}

      {/* User List Table */}
      {activeTab === 'list' && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full text-base text-left border rounded-xl shadow-sm bg-white">
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
            <tbody>
              {users.map(u => (
                <tr key={u.faculty_id} className="hover:bg-blue-50">
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
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm"
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
