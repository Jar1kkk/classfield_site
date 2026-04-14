import { Link } from 'react-router-dom'

export default function ListingCard({ listing }) {
  const mainImage = listing.images?.find((img) => img.is_main) || listing.images?.[0]

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-card__image">
        {mainImage ? (
          <img src={`http://127.0.0.1:8000${mainImage.image}`} alt={listing.title} />
        ) : (
          <div className="listing-card__no-image">Фото відсутнє</div>
        )}
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