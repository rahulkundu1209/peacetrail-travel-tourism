"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./PackageDetails.css"

function PackageDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPackageDetails()
  }, [id])

  const fetchPackageDetails = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/api/packages/${id}`)

      if (!response.ok) throw new Error("Package not found")

      const data = await response.json()
      setPkg(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching package details:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-container">Loading package details...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => navigate("/packages")} className="btn btn-primary">
          Back to Packages
        </button>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="error-container">
        <p>Package not found</p>
        <button onClick={() => navigate("/packages")} className="btn btn-primary">
          Back to Packages
        </button>
      </div>
    )
  }

  return (
    <div className="package-details">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <button onClick={() => navigate(-1)} className="breadcrumb-link">
            ← Go Back
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="details-hero">
        <img src={pkg.image_url || "/placeholder.svg"} alt={pkg.name} className="hero-image" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="package-title">{pkg.name}</h1>
          <div className="hero-meta">
            <span className="meta-item">📍 {pkg.location}</span>
            <span className="meta-item">⏱️ {pkg.days} Days</span>
            <span className="meta-item badge-featured">Featured</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="details-content">
        <div className="container">
          <div className="content-grid">
            {/* Left Column */}
            <div className="details-main">
              {/* Description */}
              <div className="section">
                <h2 className="section-heading">About This Package</h2>
                <p className="description-text">{pkg.description}</p>
              </div>

              {/* Itinerary */}
              <div className="section">
                <h2 className="section-heading">Day-by-Day Itinerary</h2>
                <div className="itinerary-timeline">
                  {pkg.itineraryList && pkg.itineraryList.length > 0 ? (
                    pkg.itineraryList.map((day, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-marker">
                          <div className="marker-dot"></div>
                          {idx < pkg.itineraryList.length - 1 && <div className="marker-line"></div>}
                        </div>
                        <div className="timeline-content">
                          <h3 className="day-title">Day {idx + 1}</h3>
                          <p className="day-description">{day}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No itinerary details available</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="section">
                <h2 className="section-heading">Package Tags</h2>
                <div className="tags-display">
                  {pkg.tags && pkg.tags.split(",").map(t => t.trim()).filter(Boolean).map((tag, idx) => (
                      <span key={idx} className="tag-badge">
                        {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="section">
                <h2 className="section-heading">Why Book With Us?</h2>
                <ul className="highlights-list">
                  <li>Expert-curated itineraries</li>
                  <li>Experienced local guides</li>
                  <li>Comfortable accommodations</li>
                  <li>All-inclusive pricing</li>
                  <li>24/7 customer support</li>
                  <li>Flexible cancellation policy</li>
                </ul>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <aside className="booking-card">
              <div className="price-section">
                <span className="price-label">Starting From</span>
                <span className="price-value">₹{pkg.price.toLocaleString()}</span>
                <span className="price-note">per person</span>
              </div>

              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{pkg.days} Days</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{pkg.location}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Package ID:</span>
                  <span className="info-value">{pkg.id}</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn btn-primary btn-full">Book Now</button>
                <button className="btn btn-outline btn-full">Ask Questions</button>
              </div>

              <div className="contact-info">
                <h4>Need Help?</h4>
                <p>Contact our travel experts</p>
                <a href="tel:+919876543210" className="contact-link">
                  📞 +91 9876543210
                </a>
                <a href="mailto:info@peacetrail.in" className="contact-link">
                  ✉️ info@peacetrail.in
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PackageDetails
