import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFavorites, toggleFavorite } from '../api/listings'
import { useAuth } from '../context/AuthContext'
import ListingCard from '../components/ListingCard'

export default function Favorites() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    getFavorites()
      .then((res) => setFavorites(res.data))
      .finally(() => setLoading(false))
  }, [user])

  const handleRemove = async (listingId) => {
    await toggleFavorite(listingId)
    setFavorites((prev) => prev.filter((f) => f.listing.id !== listingId))
  }

  if (loading) return <div className="detail-loading">Завантаження...</div>

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>Обране</h1>
        <span className="favorites-count">{favorites.length} оголошень</span>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <p>У вас ще немає обраних оголошень</p>
          <button className="btn btn--primary" onClick={() => navigate('/')}>
            Перейти до оголошень
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div key={fav.id} className="favorites-item">
              <ListingCard listing={fav.listing} />
              <button
                className="favorites-remove"
                onClick={() => handleRemove(fav.listing.id)}
              >
                Видалити з обраного
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}