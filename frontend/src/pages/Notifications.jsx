import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotif } from '../context/NotifContext'
import { getNotifications } from '../api/chat'

export default function Notifications() {
  const { user } = useAuth()
  const { setNotifCount } = useNotif()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getNotifications()
      .then((res) => {
        setNotifications(res.data)
        setNotifCount(0)
      })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="detail-loading">Завантаження...</div>

  return (
    <div className="notif-page">
      <h1>Сповіщення</h1>
      {notifications.length === 0 ? (
        <div className="favorites-empty">
          <p>Немає сповіщень</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="notif-item"
              onClick={() => n.listing_id && navigate(`/listings/${n.listing_id}`)}
            >
              <div className="notif-item__icon">
                {n.type === 'listing_sold' ? '🔴' : '💬'}
              </div>
              <div className="notif-item__body">
                <p className="notif-item__text">{n.text}</p>
                <span className="notif-item__time">
                  {new Date(n.created_at).toLocaleDateString('uk-UA')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}