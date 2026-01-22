import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Signup() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<'attorney' | 'expert'>('attorney');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organization: '',
    title: '',
    firmSize: '',
    terms: false,
    marketing: false
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.terms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
            firm_name: formData.organization || null,
            practice_area: formData.title || null,
          },
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (data.user) {
        if (data.session) {
          navigate('/dashboard');
        } else {
          setError('Account created! However, email confirmation may be required. Please check your email or try logging in.');
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrganizationLabel = () => {
    return accountType === 'expert' ? 'Company/Institution' : 'Law Firm/Organization';
  };

  const getTitleOptions = () => {
    if (accountType === 'expert') {
      return [
        { value: '', label: 'Select Title' },
        { value: 'professor', label: 'Professor' },
        { value: 'consultant', label: 'Consultant' },
        { value: 'engineer', label: 'Engineer' },
        { value: 'doctor', label: 'Medical Doctor' },
        { value: 'other', label: 'Other' }
      ];
    } else {
      return [
        { value: '', label: 'Select Title' },
        { value: 'partner', label: 'Partner' },
        { value: 'associate', label: 'Associate' },
        { value: 'solo', label: 'Solo Practitioner' },
        { value: 'paralegal', label: 'Paralegal' },
        { value: 'other', label: 'Other' }
      ];
    }
  };

  return (
    <div className="bg-[#fdfcf9] min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fa-solid fa-gavel text-brand-navy text-2xl"></i>
              <span className="text-2xl font-serif font-bold text-brand-navy">Witnex</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-brand-slate text-sm">Already have an account?</span>
              <Link to="/login" className="text-brand-gold font-semibold hover:text-brand-gold-light transition-colors duration-300">Log In</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-brand-navy leading-tight">Join the Leading Expert Witness Platform</h1>
                <p className="mt-4 text-lg text-brand-slate">Connect with qualified experts, streamline your case preparation, and find the perfect witness for your legal needs.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-brand-gold bg-opacity-10 p-3 rounded-lg">
                    <i className="fa-solid fa-search text-brand-gold text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-navy">Advanced Search Capabilities</h3>
                    <p className="text-brand-slate">Find experts by specialty, location, experience, and case history with our powerful search filters.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-brand-gold bg-opacity-10 p-3 rounded-lg">
                    <i className="fa-solid fa-certificate text-brand-gold text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-navy">Verified Expert Profiles</h3>
                    <p className="text-brand-slate">All experts are thoroughly vetted with verified credentials, experience, and testimonials.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-brand-gold bg-opacity-10 p-3 rounded-lg">
                    <i className="fa-solid fa-handshake text-brand-gold text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-navy">Direct Communication</h3>
                    <p className="text-brand-slate">Message experts directly, schedule consultations, and manage all communications in one place.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-brand-gold bg-opacity-10 p-3 rounded-lg">
                    <i className="fa-solid fa-chart-line text-brand-gold text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-navy">Case Management Tools</h3>
                    <p className="text-brand-slate">Track your cases, save favorite experts, and access detailed analytics on your expert witness usage.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-subtle border border-brand-gold border-opacity-20">
                <div className="flex items-center space-x-3 mb-4">
                  <i className="fa-solid fa-star text-brand-gold"></i>
                  <span className="font-semibold text-brand-navy">Trusted by 500+ Law Firms</span>
                </div>
                <p className="text-brand-slate text-sm">"Witnex has revolutionized how we find and work with expert witnesses. The platform is intuitive, comprehensive, and has saved us countless hours."</p>
                <div className="flex items-center mt-4 space-x-3">
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" alt="Attorney" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">Sarah Mitchell</p>
                    <p className="text-brand-slate text-xs">Partner, Mitchell & Associates</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lift p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Create Your Account</h2>
                <p className="mt-2 text-brand-slate">Start your free trial today - no credit card required</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-3">Account Type</label>
                  <div className="max-w-sm">
                    <label className="relative block">
                      <input
                        type="radio"
                        name="accountType"
                        value="attorney"
                        checked={accountType === 'attorney'}
                        onChange={() => setAccountType('attorney')}
                        className="sr-only peer"
                      />
                      <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer peer-checked:border-brand-gold peer-checked:bg-brand-gold peer-checked:bg-opacity-5 transition-all duration-200">
                        <i className="fa-solid fa-scale-balanced text-brand-gold text-xl mb-2 block"></i>
                        <span className="font-semibold text-brand-navy text-sm">Attorney/Law Firm</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-brand-navy mb-2">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-brand-navy mb-2">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-brand-navy mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-brand-navy mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-slate hover:text-brand-charcoal"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-brand-slate">Must be at least 8 characters with numbers and letters</p>
                </div>

                <div>
                  <div>
                    <label htmlFor="organization" className="block text-sm font-semibold text-brand-navy mb-2">
                      {getOrganizationLabel()} <span className="text-brand-slate font-normal text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-semibold text-brand-navy mb-2">
                        Title/Position <span className="text-brand-slate font-normal text-xs">(Optional)</span>
                      </label>
                      <select
                        id="title"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                      >
                        {getTitleOptions().map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="firmSize" className="block text-sm font-semibold text-brand-navy mb-2">
                        Firm Size <span className="text-brand-slate font-normal text-xs">(Optional)</span>
                      </label>
                      <select
                        id="firmSize"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                      >
                        <option value="">Select Size</option>
                        <option value="1">Solo (1 attorney)</option>
                        <option value="2-10">Small (2-10 attorneys)</option>
                        <option value="11-50">Medium (11-50 attorneys)</option>
                        <option value="50+">Large (50+ attorneys)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-brand-navy mb-2">Primary Practice Areas</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <label className="flex items-center">
                        <input type="checkbox" value="personal-injury" className="text-brand-gold focus:ring-brand-gold rounded mr-2" />
                        <span className="text-sm text-brand-charcoal">Personal Injury</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" value="medical-malpractice" className="text-brand-gold focus:ring-brand-gold rounded mr-2" />
                        <span className="text-sm text-brand-charcoal">Medical Malpractice</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" value="construction" className="text-brand-gold focus:ring-brand-gold rounded mr-2" />
                        <span className="text-sm text-brand-charcoal">Construction</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" value="intellectual-property" className="text-brand-gold focus:ring-brand-gold rounded mr-2" />
                        <span className="text-sm text-brand-charcoal">Intellectual Property</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" value="employment" className="text-brand-gold focus:ring-brand-gold rounded mr-2" />
                        <span className="text-sm text-brand-charcoal">Employment Law</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" value="other" className="text-brand-gold focus:ring-brand-gold rounded mr-2" />
                        <span className="text-sm text-brand-charcoal">Other</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                    required
                    className="mt-1 text-brand-gold focus:ring-brand-gold rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-brand-charcoal">
                    I agree to the <Link to="/terms-of-service" className="text-brand-gold hover:text-brand-gold-light">Terms of Service</Link> and <Link to="/privacy-policy" className="text-brand-gold hover:text-brand-gold-light">Privacy Policy</Link>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={formData.marketing}
                    onChange={(e) => setFormData({ ...formData, marketing: e.target.checked })}
                    className="mt-1 text-brand-gold focus:ring-brand-gold rounded"
                  />
                  <label htmlFor="marketing" className="text-sm text-brand-charcoal">
                    I'd like to receive updates about new features and expert witnesses (optional)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-gold text-white font-semibold py-4 rounded-lg hover:bg-brand-gold-light transition-colors duration-300 transform hover:-translate-y-0.5 shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account & Start Free Trial'
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs text-brand-slate">By signing up, you'll get immediate access to our expert database with a 14-day free trial</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
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
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">For Law Firms</a></li>
                <li><a href="/expert-signup" className="text-brand-gray-medium hover:text-white transition-colors">For Experts</a></li>
                <li><a href="/pricing" className="text-brand-gray-medium hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold tracking-wider uppercase">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="text-brand-gray-medium hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-brand-slate pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-brand-gray-medium text-sm">&copy; 2026 Witnex. All Rights Reserved.</p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-linkedin-in"></i></a>
                <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-facebook-f"></i></a>
              </div>
            </div>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="/terms-of-service" className="text-brand-gray-medium hover:text-white transition-colors text-sm">Terms of Service</a>
              <span className="text-brand-gray-medium">•</span>
              <a href="/privacy-policy" className="text-brand-gray-medium hover:text-white transition-colors text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
