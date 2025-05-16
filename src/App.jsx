import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './context/AppContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import History from './pages/History';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppContent() {
  const { currentUser, authLoading } = useAppContext();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          currentUser ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LocalizationProvider>
  );
}

export default App;
