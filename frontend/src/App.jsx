import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login_Page/Login';
import CreateEvent from './components/Event_Creation/CreateEvent';
import MainLayout from './components/Layout/MainLayout';
import ReportGeneration from './components/Report_Generation/ReportGeneration';
import EventLogs from './components/EventLogs/EventLogs';

import FacultyInbox from './components/Event_Inbox/Roles_Inbox/FacultyInbox';
import HigherAuthorityInbox from './components/Event_Inbox/Roles_Inbox/HigherAuthorityInbox';
import CreateUserForm from './components/Login_Page/CreateUserForm';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path='/' element={<Login />} />

        {/* Protected routes with Navbar */}
        <Route element={<MainLayout />}>
          {/* Create new event */}
         <Route path="/create-event" element={<CreateEvent />} />
         <Route path="/create-event/:eventId" element={<CreateEvent />} />
          <Route path='/event-logs' element={<EventLogs />} />
          <Route path='/faculty-inbox' element={<FacultyInbox />} />
          <Route path='/higherauthority-inbox' element={<HigherAuthorityInbox />} />
          <Route path="/higherauthority/:eventId" element={<HigherAuthorityInbox />} />
          <Route path='/report-generation' element={<ReportGeneration />} />
          <Route path='/create-user' element={<CreateUserForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
