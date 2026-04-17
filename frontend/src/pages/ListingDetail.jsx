import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListing, toggleFavorite, deleteListing } from '../api/listings'
import { useAuth } from '../context/AuthContext'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [favorited, setFavorited] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getListing(id)
      .then((res) => {
        setListing(res.data)
        setFavorited(res.data.is_favorited)
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const handleFavorite = async () => {
    if (!user) return navigate('/login')
    try {
      await toggleFavorite(id)
      setFavorited((prev) => !prev)
    } catch {}
  }

  const handleDelete = async () => {
    if (!window.confirm('Видалити оголошення?')) return
    setDeleting(true)
    try {
      await deleteListing(id)
      navigate('/')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) return <div className="detail-loading">Завантаження...</div>
  if (!listing) return null

  const isOwner = user?.id === listing.user?.id

  const conditionLabel = {
    new: 'Новий',
    used: 'Б/У',
    refurbished: 'Відновлений',
  }

  return (
    <div className="detail-page">
      <div className="detail-container">

        {/* Галерея */}
        <div className="detail-gallery">
          <div className="detail-gallery__main">
            {listing.images?.length > 0 ? (
              <img
                src={listing.images[activeImage]?.image}
                alt={listing.title}
              />
            ) : (
              <div className="detail-gallery__empty">Фото відсутнє</div>
            )}
          </div>
          {listing.images?.length > 1 && (
            <div className="detail-gallery__thumbs">
              {listing.images.map((img, i) => (
                <img
                  key={img.id}
                  src={img.image}
                  alt={`thumb-${i}`}
                  className={`detail-gallery__thumb ${i === activeImage ? 'detail-gallery__thumb--active' : ''}`}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Інфо */}
        <div className="detail-info">
          <div className="detail-info__header">
            <span className="detail-category">{listing.category_name}</span>
            <span className={`badge badge--${listing.condition}`}>
              {conditionLabel[listing.condition]}
            </span>
          </div>

          <h1 className="detail-title">{listing.title}</h1>
          <p className="detail-price">{Number(listing.price).toLocaleString()} ₴</p>

          <div className="detail-meta">
            <span>📍 {listing.city}</span>
            <span>👁 {listing.views_count} переглядів</span>
            <span>📅 {new Date(listing.created_at).toLocaleDateString('uk-UA')}</span>
          </div>

          {/* Продавець */}
          <div className="detail-seller">
            <div className="detail-seller__info">
              <div className="detail-seller__avatar">
                {listing.user?.avatar ? (
                  <img src={listing.user.avatar} alt="avatar" />
                ) : (
                  <div className="detail-seller__avatar-placeholder">
                    {listing.user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="detail-seller__name">{listing.user?.username}</p>
                <p className="detail-seller__city">{listing.user?.city || 'Місто не вказано'}</p>
              </div>
            </div>
            {listing.user?.phone && (
              <a href={`tel:${listing.user.phone}`} className="btn btn--primary btn--full">
                📞 {listing.user.phone}
              </a>
            )}
          </div>

          {/* Дії */}
          <div className="detail-actions">
            {!isOwner && (
              <button
                className={`btn ${favorited ? 'btn--favorited' : 'btn--outline'} btn--full`}
                onClick={handleFavorite}
              >
                {favorited ? '❤️ В обраному' : '🤍 Додати в обране'}
              </button>
            )}
            {isOwner && (
              <div className="detail-owner-actions">
                <Link to={`/listings/${id}/edit`} className="btn btn--outline btn--full">
                  Редагувати
                </Link>
                <button
                  className="btn btn--danger btn--full"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Видалення...' : 'Видалити'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Опис */}
      <div className="detail-description">
        <h2>Опис</h2>
        <p>{listing.description || 'Опис відсутній'}</p>
      </div>
    </div>
  )
}