import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../api/auth'
import { getMyListings, deleteListing } from '../api/listings'

export default function Profile() {
  const { user, setUser, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    username: '',
    phone: '',
    city: '',
    bio: '',
  })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    setForm({
      username: user.username || '',
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
    })
    getMyListings()
      .then((res) => setListings(res.data))
      .finally(() => setLoading(false))
  }, [user])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      const res = await updateProfile(form)
      setUser(res.data)
      setSuccess('Профіль оновлено!')
      setTimeout(() => setSuccess(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити оголошення?')) return
    await deleteListing(id)
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  const statusLabel = { active: 'Активне', sold: 'Продано', archived: 'В архіві' }
  const statusClass = { active: 'badge--new', sold: 'badge--used', archived: 'badge--ref' }

  if (loading) return <div className="detail-loading">Завантаження...</div>

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" />
          ) : (
            <div className="profile-avatar__placeholder">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1>{user?.username}</h1>
          <p className="profile-email">{user?.email}</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'listings' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('listings')}
        >
          Мої оголошення ({listings.length})
        </button>
        <button
          className={`admin-tab ${tab === 'edit' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('edit')}
        >
          Редагувати профіль
        </button>
      </div>

      {/* Мої оголошення */}
      {tab === 'listings' && (
        <div className="profile-listings">
          {listings.length === 0 ? (
            <div className="favorites-empty">
              <p>У вас ще немає оголошень</p>
              <Link to="/listings/create" className="btn btn--primary">
                Створити оголошення
              </Link>
            </div>
          ) : (
            listings.map((l) => (
              <div key={l.id} className="profile-listing-item">
                <div className="profile-listing-item__image">
                  {l.images?.[0] ? (
                    <img src={l.images[0].image} alt={l.title} />
                  ) : (
                    <div className="listing-card__no-image">Фото відсутнє</div>
                  )}
                </div>
                <div className="profile-listing-item__info">
                  <Link to={`/listings/${l.id}`} className="profile-listing-item__title">
                    {l.title}
                  </Link>
                  <p className="profile-listing-item__price">
                    {Number(l.price).toLocaleString()} ₴
                  </p>
                  <p className="profile-listing-item__meta">
                    {l.city} · {l.category_name}
                  </p>
                  <span className={`badge ${statusClass[l.status]}`}>
                    {statusLabel[l.status]}
                  </span>
                </div>
                <div className="profile-listing-item__actions">
                  <Link to={`/listings/${l.id}/edit`} className="btn btn--outline">
                    Редагувати
                  </Link>
                  <button
                    className="btn btn--danger"
                    onClick={() => handleDelete(l.id)}
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Редагування профілю */}
      {tab === 'edit' && (
        <div className="profile-edit">
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label>Імʼя користувача</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+380..."
                />
              </div>
            </div>
            <div className="form-group">
              <label>Місто</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Київ"
              />
            </div>
            <div className="form-group">
              <label>Про себе</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Розкажіть про себе..."
              />
            </div>
            {success && <p className="profile-success">{success}</p>}
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}