import { useState, useEffect } from 'react'
import { getListings, getCategories } from '../api/listings'
import ListingCard from '../components/ListingCard'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 12

export default function Home() {
  const [listings, setListings] = useState([])
  const PAGE_SIZE = 12
  const [categories, setCategories] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    ordering: '-created_at',
    min_price: '',
    max_price: '',
    city: '',
  })

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    fetchListings()
  }, [page, filters])

  const fetchListings = () => {
    setLoading(true)
    const params = { page, page_size: PAGE_SIZE, ...filters }
    if (search) params.title = search
    Object.keys(params).forEach((k) => (params[k] === '' || params[k] === null) && delete params[k])
    getListings(params)
      .then((res) => {
        setListings(res.data.results || res.data)
        setCount(res.data.count || res.data.length)
      })
      .finally(() => setLoading(false))
  }

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchListings()
  }

  const handleReset = () => {
    setSearch('')
    setFilters({ category: '', condition: '', ordering: '-created_at', min_price: '', max_price: '', city: '' })
    setPage(1)
  }

  return (
    <div className="home">
      <div className="home__hero">
        <h1>Комп'ютерна техніка</h1>
        <p>Купуй та продавай комплектуючі, ноутбуки та периферію</p>
        <form className="hero-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Пошук оголошень..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn--primary">Знайти</button>
        </form>
      </div>

      <div className="home__content">
        <aside className="filters">
          <div className="filters__header">
            <h3>Фільтри</h3>
            <button className="filters__reset" onClick={handleReset}>Скинути</button>
          </div>

          <div className="filters__group">
            <label>Категорія</label>
            <select value={filters.category} onChange={(e) => handleFilter('category', e.target.value)}>
              <option value="">Всі категорії</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filters__group">
            <label>Стан</label>
            <select value={filters.condition} onChange={(e) => handleFilter('condition', e.target.value)}>
              <option value="">Будь-який</option>
              <option value="new">Новий</option>
              <option value="used">Б/У</option>
              <option value="refurbished">Відновлений</option>
            </select>
          </div>

          <div className="filters__group">
            <label>Місто</label>
            <input
              type="text"
              placeholder="Київ"
              value={filters.city}
              onChange={(e) => handleFilter('city', e.target.value)}
            />
          </div>

          <div className="filters__group">
            <label>Ціна від (₴)</label>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={filters.min_price}
              onChange={(e) => handleFilter('min_price', e.target.value)}
            />
          </div>

          <div className="filters__group">
            <label>Ціна до (₴)</label>
            <input
              type="number"
              placeholder="100000"
              min="0"
              value={filters.max_price}
              onChange={(e) => handleFilter('max_price', e.target.value)}
            />
          </div>

          <div className="filters__group">
            <label>Сортування</label>
            <select value={filters.ordering} onChange={(e) => handleFilter('ordering', e.target.value)}>
              <option value="-created_at">Новіші спочатку</option>
              <option value="created_at">Старіші спочатку</option>
              <option value="price">Ціна: від низької</option>
              <option value="-price">Ціна: від високої</option>
              <option value="-views_count">Популярні</option>
            </select>
          </div>
        </aside>

        <main className="listings">
          <div className="listings__info">
            {!loading && <span>Знайдено: {count} оголошень</span>}
          </div>
          {loading ? (
            <div className="listings__loading">Завантаження...</div>
          ) : listings.length === 0 ? (
            <div className="listings__empty">
              <p>Оголошень не знайдено</p>
              <button className="btn btn--outline" onClick={handleReset}>Скинути фільтри</button>
            </div>
          ) : (
            <>
              <div className="listings__grid">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <Pagination count={count} pageSize={PAGE_SIZE} current={page} onPageChange={handlePageChange} />
            </>
          )}
        </main>
      </div>
    </div>
  )
}