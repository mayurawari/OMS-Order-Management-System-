import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Register from './components/Register';
import Cart from './components/Cart';
import './App.css';

function App() {
  // For demo, use localStorage for role; in real app, use context/auth
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user" element={role === 'user' ? <UserDashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={role === 'user' ? <Cart /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
