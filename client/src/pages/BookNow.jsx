import { useEffect, useRef, useState } from "react";
import "./BookNow.css";
import { useNavigate, useParams } from "react-router-dom";

const BookNow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    tourDate: "",
    persons: "",
  });
  const [bookingInformation, setBookingInformation] = useState(null);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [verified, setVerified] = useState(false);
  const [enteredOTP, setEnteredOTP] = useState("");

  useEffect(() => {
    fetchPackageDetails();
  }, [id]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/packages/${id}`);

      if (!response.ok) throw new Error("Package not found");

      const data = await response.json();
      console.log(data);
      setPkg(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching package details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueBooking = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.mobile ||
      !formData.email ||
      !formData.tourDate ||
      !formData.persons
    ) {
      alert("Please fill all the required fields.");
      return;
    }

    setBookingInformation({
      ...formData,
      packageId: pkg.id,
    });
    setShowOTPVerification(true);

    
  };

  const otpVerificationHandler = async () =>{
    // call api to verify otp
  }

  const sendOTPHandler = async () =>{
    // call api to send otp
  }

  if (loading) {
    return <div className="loading-container">Loading package details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button
          onClick={() => navigate("/packages")}
          className="btn btn-primary"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="error-container">
        <p>Package not found</p>
        <button
          onClick={() => navigate("/packages")}
          className="btn btn-primary"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  return (
    <div className="booking-details">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <button onClick={() => navigate(-1)} className="breadcrumb-link">
            ← Go Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <section className="details-content">
        <div className="container">
          <div className="content-grid">
            {/* Left Column */}
            <div className="booking-form">
              {!showOTPVerification ? (
                <form
                  className="booking-form-wrapper"
                >
                  <h2>Book Your Package</h2>

                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      placeholder="Enter your full name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      className="form-input"
                      placeholder="Enter your mobile number"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      placeholder="Enter your email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tourDate">Tour Date</label>
                    <input
                      type="date"
                      id="tourDate"
                      name="tourDate"
                      className="form-input"
                      required
                      value={formData.tourDate}
                      onChange={(e) => setFormData({ ...formData, tourDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="persons">Number of Persons</label>
                    <input
                      type="number"
                      id="persons"
                      name="persons"
                      className="form-input"
                      min="1"
                      placeholder="Enter number of persons"
                      required
                      value={formData.persons}
                      onChange={(e) => setFormData({ ...formData, persons: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary form-submit"
                    onClick={handleContinueBooking}
                    >
                    Continue
                  </button>
                </form>
              ) : !verified ? (
                <form
                  className="booking-form-wrapper"
                  onSubmit={(e) => handleSendOTP(e)}
                >
                  <h2>Verify Your Email</h2>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                      value={bookingInformation.email}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="otp">OTP</label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      className="form-input"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      value={enteredOTP}
                      onChange={(e)=>setEnteredOTP(e.target.value)}
                      required
                    />
                  </div>
                  <button onClick={sendOTPHandler}>
                    Resend OTP
                  </button>
                  <div>
                    <button onClick={otpVerificationHandler} type="submit" className="btn btn-primary form-submit">
                      Verify OTP
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {setShowOTPVerification(false)}}
                    >
                      Back
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  OTP Verified
                </div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <aside className="booking-card">
              <h3>{pkg.name}</h3>
              <div className="price-section">
                <span className="price-label">Starting From</span>
                <span className="price-value">
                  ₹{pkg.price.toLocaleString()}
                </span>
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
  );
};

export default BookNow;
