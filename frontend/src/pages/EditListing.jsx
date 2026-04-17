import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getListing, updateListing, getCategories } from '../api/listings'
import { useAuth } from '../context/AuthContext'

export default function EditListing() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'used',
    city: '',
    category: '',
    status: 'active',
  })

  useEffect(() => {
    if (!user) navigate('/login')
    Promise.all([getListing(id), getCategories()])
      .then(([listingRes, categoriesRes]) => {
        const l = listingRes.data
        if (l.user?.id !== user?.id) {
          navigate('/')
          return
        }
        setForm({
          title: l.title,
          description: l.description,
          price: l.price,
          condition: l.condition,
          city: l.city,
          category: l.category,
          status: l.status,
        })
        setCategories(categoriesRes.data)
      })
      .finally(() => setLoading(false))
  }, [id, user])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await updateListing(id, form)
      navigate(`/listings/${id}`)
    } catch (err) {
      const data = err.response?.data
      if (data) setErrors(data)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="detail-loading">Завантаження...</div>

  return (
    <div className="create-page">
      <div className="create-card">
        <h2>Редагування оголошення</h2>
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Назва *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Категорія *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Виберіть категорію</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>Стан *</label>
              <select name="condition" value={form.condition} onChange={handleChange}>
                <option value="new">Новий</option>
                <option value="used">Б/У</option>
                <option value="refurbished">Відновлений</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ціна (₴) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                required
              />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label>Місто *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Статус</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Активне</option>
              <option value="sold">Продано</option>
              <option value="archived">В архіві</option>
            </select>
          </div>

          <div className="form-group">
            <label>Опис</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="edit-actions">
            <button
              type="button"
              className="btn btn--outline btn--full"
              onClick={() => navigate(`/listings/${id}`)}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={saving}
            >
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}