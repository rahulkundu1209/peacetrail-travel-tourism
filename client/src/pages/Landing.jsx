"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import PackageCard from "../components/PackageCard"
import "./Landing.css"

function Landing() {
  const [featuredPackages, setFeaturedPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFeaturedPackages()
  }, [])

  const fetchFeaturedPackages = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/api/packages/featured`)

      if (!response.ok) throw new Error("Failed to fetch featured packages")

      const data = await response.json()
      setFeaturedPackages(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching featured packages:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Explore the Magic of India</h1>
          <p className="hero-subtitle">
            Discover unforgettable journeys through India's most breathtaking destinations
          </p>
          <Link to="/packages" className="btn btn-primary btn-lg">
            Explore All Packages
          </Link>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Packages</h2>
            <p className="section-subtitle">Handpicked travel experiences curated just for you</p>
          </div>

          {loading ? (
            <div className="loading">Loading packages...</div>
          ) : error ? (
            <div className="error-message">
              <p>Failed to load packages: {error}</p>
              <button onClick={fetchFeaturedPackages} className="btn btn-secondary">
                Try Again
              </button>
            </div>
          ) : featuredPackages.length > 0 ? (
            <div className="packages-grid">
              {featuredPackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          ) : (
            <div className="no-packages">
              <p>No featured packages available at the moment.</p>
            </div>
          )}

          <div className="view-all-container">
            <Link to="/packages" className="btn btn-outline btn-lg">
              View All Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <h2 className="section-title">Why Choose PeaceTrail?</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Expert Itineraries</h3>
              <p>Carefully planned journeys to maximize your experience</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Local Guides</h3>
              <p>Experience authentic culture with knowledgeable guides</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Best Value</h3>
              <p>Competitive pricing without compromising quality</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support during your travels</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
