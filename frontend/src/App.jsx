import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login_Page/Login";
import CreateEvent from "./components/Event_Creation/CreateEvent";
import MainLayout from "./components/Layout/MainLayout";
import ReportGeneration from "./components/Report_Generation/ReportGeneration";
import EventLogs from "./components/EventLogs/EventLogs";
import EventInbox from "./components/Event_Inbox/EventInbox";
// import other pages like Inbox, ReportGeneration, etc.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes with Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event-logs" element={<EventLogs />} />
          <Route path="/inbox" element={<EventInbox />} />
           <Route path="/report-generation" element={<ReportGeneration />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
