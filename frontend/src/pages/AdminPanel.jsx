import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getAdminStats, getAdminListings, getAdminUsers,
  updateListingStatus, adminDeleteListing,
  getAdminCategories, createAdminCategory, deleteAdminCategory
} from '../api/admin'

export default function AdminPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '' })
  const [catError, setCatError] = useState('')

  useEffect(() => {
    if (!user?.is_staff) { navigate('/'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, listingsRes, usersRes, catsRes] = await Promise.all([
        getAdminStats(),
        getAdminListings(),
        getAdminUsers(),
        getAdminCategories(),
      ])
      setStats(statsRes.data)
      setListings(listingsRes.data)
      setUsers(usersRes.data)
      setCategories(catsRes.data)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    await updateListingStatus(id, status)
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Видалити оголошення?')) return
    await adminDeleteListing(id)
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    setCatError('')
    try {
      const res = await createAdminCategory(newCat)
      setCategories((prev) => [...prev, res.data])
      setNewCat({ name: '', slug: '', description: '' })
    } catch (err) {
      const data = err.response?.data
      setCatError(data?.slug?.[0] || data?.name?.[0] || 'Помилка')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Видалити категорію? Всі оголошення в ній втратять категорію.')) return
    await deleteAdminCategory(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) return <div className="detail-loading">Завантаження...</div>

  const statusLabel = { active: 'Активне', sold: 'Продано', archived: 'В архіві' }
  const conditionLabel = { new: 'Новий', used: 'Б/У', refurbished: 'Відновлений' }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Панель адміністратора</h1>
      </div>

      <div className="admin-tabs">
        {['stats', 'listings', 'categories', 'users'].map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {{ stats: 'Статистика', listings: 'Оголошення', categories: 'Категорії', users: 'Користувачі' }[t]}
          </button>
        ))}
      </div>

      {/* Статистика */}
      {tab === 'stats' && stats && (
        <div className="admin-stats">
          {[
            { value: stats.users, label: 'Користувачів', mod: '' },
            { value: stats.listings, label: 'Всього оголошень', mod: '' },
            { value: stats.active_listings, label: 'Активних', mod: 'green' },
            { value: stats.sold_listings, label: 'Продано', mod: 'red' },
            { value: stats.archived_listings, label: 'В архіві', mod: 'gray' },
            { value: stats.categories, label: 'Категорій', mod: '' },
          ].map((s, i) => (
            <div key={i} className={`stat-card ${s.mod ? `stat-card--${s.mod}` : ''}`}>
              <p className="stat-card__value">{s.value}</p>
              <p className="stat-card__label">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Оголошення */}
      {tab === 'listings' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Назва</th>
                <th>Продавець</th>
                <th>Ціна</th>
                <th>Стан</th>
                <th>Категорія</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>
                    <Link to={`/listings/${l.id}`} className="admin-link">{l.title}</Link>
                  </td>
                  <td>{l.user?.username}</td>
                  <td>{Number(l.price).toLocaleString()} ₴</td>
                  <td>{conditionLabel[l.condition]}</td>
                  <td>{l.category_name}</td>
                  <td>
                    <select
                      className={`admin-status admin-status--${l.status}`}
                      value={l.status}
                      onChange={(e) => handleStatusChange(l.id, e.target.value)}
                    >
                      <option value="active">Активне</option>
                      <option value="sold">Продано</option>
                      <option value="archived">В архіві</option>
                    </select>
                  </td>
                  <td>{new Date(l.created_at).toLocaleDateString('uk-UA')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/listings/${l.id}/edit`} className="btn btn--outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                        Ред.
                      </Link>
                      <button
                        className="btn btn--danger"
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteListing(l.id)}
                      >
                        Вид.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Категорії */}
      {tab === 'categories' && (
        <div className="admin-categories">
          <div className="admin-cat-form">
            <h3>Додати категорію</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="form-row">
                <div className="form-group">
                  <label>Назва *</label>
                  <input
                    type="text"
                    value={newCat.name}
                    onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Відеокарти"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input
                    type="text"
                    value={newCat.slug}
                    onChange={(e) => setNewCat((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="videokart"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Опис</label>
                <input
                  type="text"
                  value={newCat.description}
                  onChange={(e) => setNewCat((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Необовʼязково"
                />
              </div>
              {catError && <p className="auth-error">{catError}</p>}
              <button type="submit" className="btn btn--primary">Додати</button>
            </form>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Назва</th>
                  <th>Slug</th>
                  <th>Опис</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td><code>{c.slug}</code></td>
                    <td>{c.description || '—'}</td>
                    <td>
                      <button
                        className="btn btn--danger"
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteCategory(c.id)}
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Користувачі */}
      {tab === 'users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Username</th>
                <th>Місто</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Дата реєстрації</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.username}</td>
                  <td>{u.city || '—'}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    {u.is_staff
                      ? <span className="badge badge--new">Адмін</span>
                      : <span className="badge badge--used">Юзер</span>
                    }
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString('uk-UA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}