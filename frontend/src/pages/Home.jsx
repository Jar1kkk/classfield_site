import { useState, useEffect } from 'react'
import { getListings, getCategories } from '../api/listings'
import ListingCard from '../components/ListingCard'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 12

export default function Home() {
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    ordering: '-created_at',
  })

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {
      page,
      page_size: PAGE_SIZE,
      ...filters,
    }
    Object.keys(params).forEach((k) => !params[k] && delete params[k])
    getListings(params)
      .then((res) => {
        setListings(res.data.results || res.data)
        setCount(res.data.count || res.data.length)
      })
      .finally(() => setLoading(false))
  }, [page, filters])

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <div className="home">
      <div className="home__hero">
        <h1>Комп'ютерна техніка</h1>
        <p>Купуй та продавай комплектуючі, ноутбуки та периферію</p>
      </div>

      <div className="home__content">
        <aside className="filters">
          <h3>Фільтри</h3>

          <div className="filters__group">
            <label>Категорія</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilter('category', e.target.value)}
            >
              <option value="">Всі категорії</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filters__group">
            <label>Стан</label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilter('condition', e.target.value)}
            >
              <option value="">Будь-який</option>
              <option value="new">Новий</option>
              <option value="used">Б/У</option>
              <option value="refurbished">Відновлений</option>
            </select>
          </div>

          <div className="filters__group">
            <label>Сортування</label>
            <select
              value={filters.ordering}
              onChange={(e) => handleFilter('ordering', e.target.value)}
            >
              <option value="-created_at">Новіші спочатку</option>
              <option value="created_at">Старіші спочатку</option>
              <option value="price">Ціна: від низької</option>
              <option value="-price">Ціна: від високої</option>
              <option value="-views_count">Популярні</option>
            </select>
          </div>
        </aside>

        <main className="listings">
          {loading ? (
            <div className="listings__loading">Завантаження...</div>
          ) : listings.length === 0 ? (
            <div className="listings__empty">Оголошень не знайдено</div>
          ) : (
            <>
              <div className="listings__grid">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <Pagination
                count={count}
                pageSize={PAGE_SIZE}
                current={page}
                onPageChange={setPage}
              />
            </>
          )}
        </main>
      </div>
    </div>
  )
}