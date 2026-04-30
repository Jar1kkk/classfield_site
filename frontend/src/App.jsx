import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateListing from './pages/CreateListing'
import ListingDetail from './pages/ListingDetail'
import EditListing from './pages/EditListing'
import Favorites from './pages/Favorites'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'
import Footer from './components/Footer'
import Chat from './pages/Chat'
import PublicProfile from './pages/PublicProfile'
import { NotifProvider } from './context/NotifContext'
import Notifications from './pages/Notifications'


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotifProvider>
          <Navbar />
          <div style={{ flex:1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings/create" element={<CreateListing />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/listings/:id/edit" element={<EditListing />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/users/:id" element={<PublicProfile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </div>
          <Footer />
        </NotifProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}