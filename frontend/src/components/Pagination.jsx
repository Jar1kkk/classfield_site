export default function Pagination({ count, pageSize = 12, current, onPageChange }) {
  const total = Math.ceil(count / pageSize)
  if (total <= 1) return null

  const pages = []
  for (let i = 1; i <= total; i++) {
    pages.push(i)
  }

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        ←
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`pagination__btn ${page === current ? 'pagination__btn--active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination__btn"
        disabled={current === total}
        onClick={() => onPageChange(current + 1)}
      >
        →
      </button>
    </div>
  )
}