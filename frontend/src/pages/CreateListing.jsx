import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing, getCategories } from '../api/listings'
import { useAuth } from '../context/AuthContext'

export default function CreateListing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'used',
    city: '',
    category: '',
  })

  useEffect(() => {
    if (!user) navigate('/login')
    getCategories().then((res) => setCategories(res.data))
  }, [user])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      setErrors((prev) => ({ ...prev, images: 'Максимум 5 фото' }))
      return
    }
    setImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
    setErrors((prev) => ({ ...prev, images: '' }))
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    if (!form.title) newErrors.title = "Вкажіть назву"
    if (!form.price || form.price <= 0) newErrors.price = "Вкажіть коректну ціну"
    if (!form.category) newErrors.category = "Виберіть категорію"
    if (!form.city) newErrors.city = "Вкажіть місто"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, val]) => data.append(key, val))
      images.forEach((img) => data.append('images', img))

      const res = await createListing(data)
      navigate(`/listings/${res.data.id}`)
    } catch (err) {
      const data = err.response?.data
      if (data) setErrors(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-card">
        <h2>Нове оголошення</h2>
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Назва *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Наприклад: RTX 4070 Ti Super"
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
                placeholder="0"
                min="0"
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
                placeholder="Київ"
              />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Опис</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Детальний опис товару, стан, комплектація..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Фото (до 5 штук)</label>
            <div className="image-upload">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImages}
                style={{ display: 'none' }}
              />
              <label htmlFor="images" className="image-upload__btn">
                + Додати фото
              </label>
              {errors.images && <span className="field-error">{errors.images}</span>}
            </div>

            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((src, i) => (
                  <div key={i} className="image-preview">
                    <img src={src} alt={`preview-${i}`} />
                    {i === 0 && <span className="image-preview__main">Головне</span>}
                    <button
                      type="button"
                      className="image-preview__remove"
                      onClick={() => removeImage(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Публікація...' : 'Опублікувати оголошення'}
          </button>
        </form>
      </div>
    </div>
  )
}