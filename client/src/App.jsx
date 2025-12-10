import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Landing from "./pages/Landing"
import Packages from "./pages/Packages"
import PackageDetails from "./pages/PackageDetails"
import "./App.css"
import BookNow from "./pages/BookNow"

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:id" element={<PackageDetails />} />
            <Route path="/book-now/:id" element={<BookNow />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
