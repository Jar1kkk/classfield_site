import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { startConversation } from '../api/chat'
import api from '../api/axios'
import ListingCard from '../components/ListingCard'

export default function PublicProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/accounts/users/${id}/`),
      api.get(`/listings/?user=${id}`)
    ]).then(([profileRes, listingsRes]) => {
      setProfile(profileRes.data)
      setListings(listingsRes.data.results || listingsRes.data)
    }).catch(() => navigate('/'))
    .finally(() => setLoading(false))
  }, [id])

  const handleChat = async (listingId) => {
    if (!user) return navigate('/login')
    const res = await startConversation(listingId)
    navigate(`/chat?conv=${res.data.id}`)
  }

  if (loading) return <div className="detail-loading">Завантаження...</div>
  if (!profile) return null

  const isMe = user?.id === profile.id

  return (
    <div className="public-profile-page">
      <div className="public-profile-header">
        <div className="profile-avatar" style={{ width: 80, height: 80, flexShrink: 0 }}>
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar" />
          ) : (
            <div className="profile-avatar__placeholder" style={{ fontSize: '2rem' }}>
              {profile.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="public-profile-header__info">
          <h1>{profile.username}</h1>
          {profile.city && <p className="public-profile-city">📍 {profile.city}</p>}
          {profile.bio && <p className="public-profile-bio">{profile.bio}</p>}
          <p className="public-profile-date">
            На сайті з {new Date(profile.created_at).toLocaleDateString('uk-UA')}
          </p>
        </div>
        {!isMe && user && (
          <div className="public-profile-header__actions">
            <button
              className="btn btn--primary"
              onClick={() => listings[0] && handleChat(listings[0].id)}
            >
              💬 Написати
            </button>
          </div>
        )}
        {isMe && (
          <button className="btn btn--outline" onClick={() => navigate('/profile')}>
            Редагувати профіль
          </button>
        )}
      </div>

      <div className="public-profile-listings">
        <h2>Оголошення ({listings.length})</h2>
        {listings.length === 0 ? (
          <div className="favorites-empty">
            <p>Немає активних оголошень</p>
          </div>
        ) : (
          <div className="listings__grid">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}