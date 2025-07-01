import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlusIcon,
  UsersIcon,
  TrashIcon,
  BuildingLibraryIcon,PencilSquareIcon
} from '@heroicons/react/24/solid';

const colleges = {
  'Institution': ['Dept A1', 'Dept A2'],
  'Engineering': ['Dept B1', 'Dept B2'],
  'Pharmacy': ['Dept B1', 'Dept B2'],
  'Nursing': ['Dept B1', 'Dept B2'],
  'HI': ['Dept B1', 'Dept B2'],
  'AHS': ['Dept B1', 'Dept B2'],
  'AAKAM360': ['Dept B1', 'Dept B2']
};

const CreateUserForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
const [uploadedHeaders, setUploadedHeaders] = useState([]); // ✅ fix
 const [editHeaderIndex, setEditHeaderIndex] = useState(null);
  const [editLogoFile, setEditLogoFile] = useState(null);

  const [form, setForm] = useState({
    faculty_id: '',
    faculty_name: '',
    designation: '',
    department: '',
    institution_name: '',
    role: 'faculty',
    email: ''
  });

  const [headerForm, setHeaderForm] = useState({
    college_name: '',

    logo: null
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [headerMessage, setHeaderMessage] = useState('');
  const [headerError, setHeaderError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/session', { credentials: 'include' });
        const data = await res.json();

        if (data.user && ['hod', 'cso', 'principal', 'admin'].includes(data.user.role)) {
          setUser(data.user);
          if (data.user.role !== 'admin') setActiveTab('list');
        } else {
          navigate('/unauthorized');
        }
      } catch {
        navigate('/login');
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users', { credentials: 'include' });
        const data = await res.json();
        setUsers(user.role === 'hod' ? data.filter(u => u.department === user.department) : data);
      } catch (err) {
        console.error('Error fetching users', err);
      }
    };
    fetchUsers();
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (user.role === 'hod' && form.role !== 'faculty') {
      return setError('HODs can only create faculty accounts.');
    }
    if (user.role === 'hod' && form.department !== user.department) {
      return setError(`As ${user.department} HOD, you can only add users to your department.`);
    }

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Failed to create user');

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

      const refreshed = await fetch('http://localhost:5000/api/users', { credentials: 'include' });
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
      if (!res.ok) return alert(data.error || 'Failed to delete user');
      setUsers(users.filter(u => u.faculty_id !== faculty_id));
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };
  const handleUpdateHeader = async (index) => {
    const header = uploadedHeaders[index];
    if (!editLogoFile) return;

    const formData = new FormData();
    formData.append('logo', editLogoFile);

    try {
      const res = await fetch(`http://localhost:5000/api/admin/uploaded-headers/${header.college_name}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to update header');

      const updatedHeaders = [...uploadedHeaders];
      updatedHeaders[index].logoUrl = data.logoUrl;
      setUploadedHeaders(updatedHeaders);
      setEditHeaderIndex(null);
      setEditLogoFile(null);
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };
  const handleDeleteHeader = async (college_name) => {
    if (!window.confirm('Are you sure you want to delete this header?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/uploaded-headers/${college_name}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Failed to delete header');
      setUploadedHeaders(prev => prev.filter(h => h.college_name !== college_name));
    } catch (err) {
      alert('Error deleting header: ' + err.message);
    }
  };
useEffect(() => {
  const fetchUploadedHeaders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/uploaded-headers', {
        credentials: 'include'
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setUploadedHeaders(data);
      } else {
        console.error("Unexpected response for headers:", data);
      }
    } catch (err) {
      console.error('Failed to load headers:', err.message);
    }
  };

  fetchUploadedHeaders();
}, []);


  const handleHeaderFormChange = e => {
    const { name, value, files } = e.target;
   setHeaderForm(prev => ({
  ...prev,
  [name]: files ? files[0] : value
}));

  };

  const handleHeaderSubmit = async e => {
    e.preventDefault();
    setHeaderError('');
    setHeaderMessage('');

    const formData = new FormData();
    formData.append('college_name', headerForm.college_name);
    formData.append('logo', headerForm.logo);

    try {
      const res = await fetch('http://localhost:5000/api/admin/upload-header', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) return setHeaderError(data.error || 'Failed to upload header');

      setHeaderMessage('✅ Header uploaded successfully!');
      setHeaderForm({ college_name: '', logo: null });

      setUploadedHeaders(prev => Array.isArray(prev) ? [...prev, {
  college_name: data.college_name || headerForm.college_name,
  logoUrl: data.logoUrl
}] : [{
  college_name: data.college_name || headerForm.college_name,
  logoUrl: data.logoUrl
}]);

    } catch (err) {
      setHeaderError('Upload failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 px-6 py-10 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-200">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-900 tracking-wider">⚙️ User Management Panel</h1>
        {user && (
          <p className="mt-2 text-lg text-gray-700 font-medium">
            Logged in as <span className="text-blue-800 font-semibold">{user.faculty_name}</span> ({user.role})
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10 gap-6 flex-wrap">
        {user?.role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('create')}
              className={`group flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition shadow-lg ${activeTab === 'create' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'}`}
            >
              <UserPlusIcon className="h-5 w-5 group-hover:scale-110 transition" />
              Create User
            </button>

            <button
              onClick={() => setActiveTab('header')}
              className={`group flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition shadow-lg ${activeTab === 'header' ? 'bg-gradient-to-r from-green-600 to-green-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'}`}
            >
              <BuildingLibraryIcon className="h-5 w-5 group-hover:scale-110 transition" />
              Add College Header
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('list')}
          className={`group flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold transition shadow-lg ${activeTab === 'list' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'}`}
        >
          <UsersIcon className="h-5 w-5 group-hover:scale-110 transition" />
          View Users
        </button>
      </div>

      {/* Create User */}
      {activeTab === 'create' && user?.role === 'admin' && (
        <>
          {error && <p className="text-red-600 text-center mb-4 font-medium">{error}</p>}
          {message && <p className="text-green-600 text-center mb-4 font-medium">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-6 text-lg">
            {['faculty_id', 'faculty_name', 'designation', 'department', 'institution_name', 'email'].map(field => (
              <div key={field}>
                <label className="block text-gray-800 font-semibold mb-1">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            ))}

            <div>
              <label className="block text-gray-800 font-semibold mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="faculty">Faculty</option>
                <option value="hod">HOD</option>
                <option value="cso">CSO</option>
                <option value="principal">Principal</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition">
              🚀 Create User
            </button>
          </form>
        </>
      )}

      {/* Upload College Header */}
    {/* Upload College Header */}
{activeTab === 'header' && user?.role === 'admin' && (
  <>
    {headerError && <p className="text-red-600 text-center mb-4 font-medium">{headerError}</p>}
    {headerMessage && <p className="text-green-600 text-center mb-4 font-medium">{headerMessage}</p>}
    
    <form onSubmit={handleHeaderSubmit} className="space-y-6 text-lg">
      <div>
        <label className="block text-gray-800 font-semibold mb-1">College</label>
        <select
          name="college_name"
          value={headerForm.college_name}
          onChange={handleHeaderFormChange}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select College</option>
          {Object.keys(colleges).map(college => (
            <option key={college} value={college}>{college}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-800 font-semibold mb-1">Logo (PNG/JPG)</label>
        <input
          type="file"
          name="logo"
          accept=".png,.jpg,.jpeg"
          onChange={handleHeaderFormChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white shadow-inner"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition"
      >
        🏫 Upload Header
      </button>
    </form>

    {uploadedHeaders.length > 0 && (
      <div className="mt-10 px-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📌 Uploaded Headers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {uploadedHeaders.map((header, index) => (
            <div key={index} className="border p-4 rounded-xl shadow-sm bg-white text-center relative">
              <img src={header.logoUrl} alt="Logo" className="h-24 mx-auto mb-3 object-contain" />
              <p className="text-gray-800 font-semibold">🏫 {header.college_name}</p>

              {editHeaderIndex === index ? (
                <div className="mt-3 space-y-2">
                  <input
                    type="file"
                    onChange={e => setEditLogoFile(e.target.files[0])}
                    className="w-full text-sm"
                    accept=".png,.jpg,.jpeg"
                  />
                  <button
                    onClick={() => handleUpdateHeader(index)}
                    className="w-full bg-green-600 text-white px-3 py-1 rounded-full text-sm hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditHeaderIndex(null)}
                    className="w-full text-red-500 text-sm mt-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => setEditHeaderIndex(index)} className="text-blue-600 hover:text-blue-800">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteHeader(header.college_name)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </>
)}

      

      {/* User List */}
      {activeTab === 'list' && (
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full text-base text-left border rounded-xl shadow-md bg-white">
            <thead className="bg-blue-100 text-blue-900 uppercase font-bold">
              <tr>
                {['Faculty ID', 'Name', 'Designation', 'Department', 'Institution', 'Email', 'Role', 'Actions'].map(header => (
                  <th key={header} className="px-4 py-3 border">{header}</th>
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
                      <button onClick={() => handleDelete(u.faculty_id)} className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm shadow-sm">
                        <TrashIcon className="h-4 w-4" /> Delete
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
