import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  return (
    <header className="bg-transparent absolute top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <nav className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <i className="fa-solid fa-gavel text-brand-navy text-xl sm:text-2xl"></i>
            <span className="text-xl sm:text-2xl font-serif font-bold text-brand-navy">Witnex</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/signup" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Find Experts</Link>
            <Link
              to="/search"
              className={`transition-colors duration-300 ${location.pathname === '/search' ? 'text-brand-gold font-semibold' : 'text-brand-charcoal hover:text-brand-gold'}`}
            >
              Search
            </Link>
            <Link
              to="/pricing"
              className={`transition-colors duration-300 ${location.pathname === '/pricing' ? 'text-brand-gold font-semibold' : 'text-brand-charcoal hover:text-brand-gold'}`}
            >
              Pricing
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/login" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300 text-sm sm:text-base">Log In</Link>
            <Link to="/signup" className="bg-brand-navy text-white px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg shadow-sm hover:bg-brand-charcoal transition-all duration-300 md:transform md:hover:-translate-y-0.5">Sign Up</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
