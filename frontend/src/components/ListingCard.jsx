import { Link, useNavigate } from 'react-router-dom'
import { toggleFavorite } from '../api/listings'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function ListingCard({ listing, onFavoriteChange }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [favorited, setFavorited] = useState(listing.is_favorited)
  const [loading, setLoading] = useState(false)

  const handleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return navigate('/login')
    if (loading) return
    setLoading(true)
    try {
      await toggleFavorite(listing.id)
      setFavorited((prev) => !prev)
      onFavoriteChange?.()
    } finally {
      setLoading(false)
    }
  }

  const mainImage = listing.images?.find((img) => img.is_main) || listing.images?.[0]

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-card__image">
        {mainImage ? (
          <img src={mainImage.image} alt={listing.title} />
        ) : (
          <div className="listing-card__no-image">Фото відсутнє</div>
        )}
        <button
          className={`listing-card__fav ${favorited ? 'listing-card__fav--active' : ''}`}
          onClick={handleFavorite}
          disabled={loading}
          title={favorited ? 'Видалити з обраного' : 'Додати в обране'}
        >
          {favorited ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="listing-card__body">
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__price">{Number(listing.price).toLocaleString()} ₴</p>
        <div className="listing-card__meta">
          <span>{listing.city}</span>
          <span>{listing.category_name}</span>
        </div>
        <div className="listing-card__condition">
          {listing.condition === 'new' && <span className="badge badge--new">Новий</span>}
          {listing.condition === 'used' && <span className="badge badge--used">Б/У</span>}
          {listing.condition === 'refurbished' && <span className="badge badge--ref">Відновлений</span>}
        </div>
      </div>
    </Link>
  )
}