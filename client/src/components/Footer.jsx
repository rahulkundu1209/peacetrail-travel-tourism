import "./Footer.css"

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About PeaceTrail</h4>
            <p>
              Discover India's most beautiful destinations with our carefully curated travel packages. Experience
              authenticity and adventure like never before.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/packages">Packages</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>Email: info@peacetrail.in</p>
            <p>Phone: +91 9876543210</p>
            <p>Location: Delhi, India</p>
          </div>

          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#facebook">Facebook</a>
              <a href="#instagram">Instagram</a>
              <a href="#twitter">Twitter</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} PeaceTrail Tour & Travel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
