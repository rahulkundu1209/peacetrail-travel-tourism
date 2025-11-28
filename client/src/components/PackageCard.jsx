import { Link } from "react-router-dom"
import "./PackageCard.css"

function PackageCard({ package: pkg }) {
  const tags =
    typeof pkg.tags === "string"
      ? pkg.tags.split(",").map(t => t.trim()).filter(Boolean)
      : Array.isArray(pkg.tags)
      ? pkg.tags
      : []

  pkg.tags = tags
  return (
    <div className="package-card">
      <div className="package-image">
        <img src={pkg.image_url || "/placeholder.svg"} alt={pkg.name} />
        <div className="package-badge">{pkg.days} days</div>
      </div>

      <div className="package-info">
        <h3 className="package-name">{pkg.name}</h3>
        <p className="package-location">📍 {pkg.location}</p>

        <div className="package-description">{pkg.description}</div>

        <div className="package-tags">
          {pkg.tags &&
            tags.map((tag, idx) => (
              <span key={idx} className="tag">
                {tag}
              </span>
            ))}
        </div>

        <div className="package-footer">
          <div className="package-price">
            <span className="price-label">From</span>
            <span className="price-amount">₹{pkg.price.toLocaleString()}</span>
          </div>
          <Link to={`/packages/${pkg.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PackageCard
