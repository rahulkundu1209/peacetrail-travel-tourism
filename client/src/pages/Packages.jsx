"use client"

import { useState, useEffect } from "react"
import PackageCard from "../components/PackageCard"
import "./Packages.css"

function Packages() {
  const [allPackages, setAllPackages] = useState([])
  const [filteredPackages, setFilteredPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [personalQuery, setPersonalQuery] = useState("");
  const [recommendationResponse, setRecommendationResponse] = useState(null);

  // Filter states
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedLocations, setSelectedLocations] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100000])

  useEffect(() => {
    fetchAllPackages()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [allPackages, selectedTags, selectedLocations, searchQuery, priceRange])

  const fetchAllPackages = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/api/packages`);

      if (!response.ok) throw new Error("Failed to fetch packages")

      const data = await response.json();
      // console.log(data);
      setAllPackages(data);
      setFilteredPackages(data);
      setError(null)
    } catch (err) {
      console.error("Error fetching packages:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = allPackages

    // Search by name or location
    if (searchQuery) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((pkg) => selectedTags.some((tag) => pkg.tags.includes(tag)))
    }

    // Filter by locations
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((pkg) => selectedLocations.includes(pkg.location))
    }

    // Filter by price range
    filtered = filtered.filter((pkg) => pkg.price >= priceRange[0] && pkg.price <= priceRange[1])

    setFilteredPackages(filtered)
  }

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleLocation = (location) => {
    setSelectedLocations((prev) => (prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]))
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSelectedLocations([])
    setSearchQuery("")
    setPriceRange([0, 100000])
  }

  const getPersonalizedRecommendation = async () => {
    // Function to get AI recommendation based on personalQuery
    if(personalQuery.trim() === "" || recommendationResponse) {
      setPersonalQuery("");
      setRecommendationResponse(null);
      return;
    }
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/api/ai/recommendation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: personalQuery }),
      });

      if (!response.ok) throw new Error("Failed to get recommendation")

      const data = await response.json();
      setRecommendationResponse(data);
      console.log("AI Recommendation:", data);
    } catch (err) {
      console.error("Error getting AI recommendation:", err)
      setRecommendationResponse({ error: err.message });
    }
  }

  // Extract unique locations and tags
  const uniqueLocations = [...new Set(allPackages.map((pkg) => pkg.location))]
  const uniqueTags = [...new Set(allPackages.flatMap((pkg) => pkg.tags))]
  const maxPrice = Math.max(...allPackages.map((pkg) => pkg.price), 100000)

  return (
    <div className="packages-page">
      <div className="page-header">
        <div className="container">
          <h1>Explore Our Packages</h1>
          <p>Find your perfect travel destination</p>
        </div>
        <div className="ai-recommendation-container">
          <h4>Get Personalized Recommendation</h4>
          <section>
          <input
            type="text"
            placeholder="What is in your mind for your next trip?"
            value={personalQuery}
            onChange={(e) => setPersonalQuery(e.target.value)}
            // className="search-input"
          />
          <button 
          onClick={getPersonalizedRecommendation}
          className="ai-recommendation-button">{recommendationResponse ? "Clear":"Search"}</button>
          </section>
         </div>
      </div>

      <div className="container packages-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            {(selectedTags.length > 0 || selectedLocations.length > 0 || searchQuery) && (
              <button onClick={clearFilters} className="btn-clear">
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          <div className="filter-section">
            <h4>Search</h4>
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Locations */}
          <div className="filter-section">
            <h4>Locations</h4>
            <div className="checkbox-group">
              {uniqueLocations.map((location) => (
                <label key={location} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(location)}
                    onChange={() => toggleLocation(location)}
                  />
                  <span>{location}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="filter-section">
            <h4>Tags</h4>
            <div className="tag-filter-group">
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag-filter ${selectedTags.includes(tag) ? "active" : ""}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                placeholder="Max"
              />
            </div>
            <div className="price-slider">
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                className="slider"
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="packages-main">
          <div className="results-info">
            <span className="result-count">
              {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {loading ? (
            <div className="loading">Loading packages...</div>
          ) : error ? (
            <div className="error-message">
              <p>Failed to load packages: {error}</p>
              <button onClick={fetchAllPackages} className="btn btn-secondary">
                Try Again
              </button>
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="packages-grid">
              {filteredPackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No packages found matching your filters. Try adjusting your search criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Packages
