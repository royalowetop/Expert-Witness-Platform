import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExpertSignup from './pages/ExpertSignup';
import Dashboard from './pages/Dashboard';
import ExpertProfile from './pages/ExpertProfile';
import SavedExperts from './pages/SavedExperts';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminPanel from './pages/AdminPanel';
import About from './pages/About';
import Blog from './pages/Blog';
import Search from './pages/Search';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/expert-profile' || location.pathname === '/saved-experts' || location.pathname === '/billing' || location.pathname === '/admin' || location.pathname === '/profile' || location.pathname === '/settings';
  const isStandalonePage = location.pathname === '/contact' || location.pathname === '/expert-signup' || location.pathname === '/terms-of-service' || location.pathname === '/privacy-policy' || location.pathname === '/about' || location.pathname === '/blog' || location.pathname === '/search';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  if (isDashboard) {
    return (
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expert-profile" element={<ExpertProfile />} />
        <Route path="/saved-experts" element={<SavedExperts />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    );
  }

  if (isStandalonePage) {
    return (
      <Routes>
        <Route path="/contact" element={<Contact />} />
        <Route path="/expert-signup" element={<ExpertSignup />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    );
  }

  return (
    <div className="bg-[#fdfcf9] font-sans text-brand-charcoal antialiased">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
