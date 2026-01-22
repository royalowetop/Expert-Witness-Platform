export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-gavel text-white text-2xl"></i>
              <span className="text-2xl font-serif font-bold">Witnex</span>
            </div>
            <p className="mt-4 text-brand-gray-medium max-w-md">The premier platform for connecting legal professionals with world-class expert witnesses.</p>
          </div>
          <div>
            <h4 className="font-semibold tracking-wider uppercase">Platform</h4>
            <ul className="mt-4 space-y-3">
              <li><a href="/signup" className="text-brand-gray-medium hover:text-white transition-colors">Find an Expert</a></li>
              <li><a href="/expert-signup" className="text-brand-gray-medium hover:text-white transition-colors">For Experts</a></li>
              <li><a href="/pricing" className="text-brand-gray-medium hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold tracking-wider uppercase">Company</h4>
            <ul className="mt-4 space-y-3">
              <li><a href="/about" className="text-brand-gray-medium hover:text-white transition-colors">About Us</a></li>
              <li><a href="/blog" className="text-brand-gray-medium hover:text-white transition-colors">Blog</a></li>
              <li><a href="/contact" className="text-brand-gray-medium hover:text-white transition-colors">Contact</a></li>
              <li><a href="/terms-of-service" className="text-brand-gray-medium hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/privacy-policy" className="text-brand-gray-medium hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-brand-slate pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-brand-gray-medium text-sm">&copy; 2026 Witnex. All Rights Reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-facebook-f"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
