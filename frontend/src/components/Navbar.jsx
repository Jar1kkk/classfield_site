import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'


export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const { unread } = useNotif()

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          TechAds
        </Link>
        <div className="navbar__links">
          {user ? (
            <>
              <Link to="/listings/create" className="btn btn--primary">
                + Додати оголошення
              </Link>
              <Link to="/profile" className="navbar__link">
                {user.username}
              </Link>
              <Link to="/chat" className="navbar__link navbar__chat-link" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Чат
                {unread > 0 && (
                  <span className="navbar__badge" style={{ position: 'static', transform: 'none' }}>
                    {unread}
                  </span>
                )}
              </Link>
              <Link to="/favorites" className="navbar__link">Обране</Link>
              {user?.is_staff && (
                <Link to="/admin-panel" className="navbar__link">Адмін</Link>
              )}
              <button className="navbar__link navbar__link--btn" onClick={handleLogout}>
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link">Вхід</Link>
              <Link to="/register" className="btn btn--primary">Реєстрація</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}