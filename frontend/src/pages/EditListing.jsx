import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getListing, updateListing, getCategories, addListingImages, deleteListingImage, setMainImage } from '../api/listings'
import { useAuth } from '../context/AuthContext'

export default function EditListing() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [imageError, setImageError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    condition: 'used', city: '', category: '', status: 'active',
  })

  useEffect(() => {
    if (!user) navigate('/login')
    Promise.all([getListing(id), getCategories()])
      .then(([listingRes, categoriesRes]) => {
        const l = listingRes.data
        if (l.user?.id !== user?.id && !user?.is_staff) {
          navigate('/')
          return
        }
        setForm({
          title: l.title, description: l.description, price: l.price,
          condition: l.condition, city: l.city, category: l.category, status: l.status,
        })
        setExistingImages(l.images || [])
        setCategories(categoriesRes.data)
      })
      .finally(() => setLoading(false))
  }, [id, user])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files)
    const total = existingImages.length + newImages.length + files.length
    if (total > 5) {
      setImageError(`Максимум 5 фото. Зараз є ${existingImages.length}`)
      return
    }
    setNewImages((prev) => [...prev, ...files])
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
    setImageError('')
  }

  const handleDeleteExisting = async (imageId) => {
    await deleteListingImage(id, imageId)
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const handleSetMain = async (imageId) => {
    await setMainImage(id, imageId)
    setExistingImages((prev) => prev.map((img) => ({ ...img, is_main: img.id === imageId })))
  }

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await updateListing(id, form)
      if (newImages.length > 0) {
        const formData = new FormData()
        newImages.forEach((img) => formData.append('images', img))
        await addListingImages(id, formData)
      }
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
            <input type="text" name="title" value={form.title} onChange={handleChange} required />
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
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" required />
            </div>
            <div className="form-group">
              <label>Місто *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} required />
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
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
          </div>

          {/* Існуючі фото */}
          {existingImages.length > 0 && (
            <div className="form-group">
              <label>Поточні фото</label>
              <div className="image-previews">
                {existingImages.map((img) => (
                  <div key={img.id} className="image-preview">
                    <img src={img.image} alt="listing" />
                    {img.is_main && <span className="image-preview__main">Головне</span>}
                    <div className="image-preview__actions">
                      {!img.is_main && (
                        <button
                          type="button"
                          className="image-preview__set-main"
                          onClick={() => handleSetMain(img.id)}
                          title="Зробити головним"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        className="image-preview__remove"
                        onClick={() => handleDeleteExisting(img.id)}
                        title="Видалити фото"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Нові фото */}
          {existingImages.length < 5 && (
            <div className="form-group">
              <label>Додати фото ({existingImages.length}/5)</label>
              <div className="image-upload">
                <input
                  type="file"
                  id="new-images"
                  multiple
                  accept="image/*"
                  onChange={handleNewImages}
                  style={{ display: 'none' }}
                />
                <label htmlFor="new-images" className="image-upload__btn">
                  + Додати фото
                </label>
                {imageError && <span className="field-error">{imageError}</span>}
              </div>
              {newPreviews.length > 0 && (
                <div className="image-previews">
                  {newPreviews.map((src, i) => (
                    <div key={i} className="image-preview">
                      <img src={src} alt={`new-${i}`} />
                      <span className="image-preview__main">Нове</span>
                      <button
                        type="button"
                        className="image-preview__remove"
                        onClick={() => removeNewImage(i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="edit-actions">
            <button type="button" className="btn btn--outline btn--full" onClick={() => navigate(`/listings/${id}`)}>
              Скасувати
            </button>
            <button type="submit" className="btn btn--primary btn--full" disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}