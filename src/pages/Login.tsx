import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);

        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. If you just signed up, please check your email for a confirmation link.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in. Check your inbox for a confirmation link.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user && data.session) {
        navigate('/dashboard');
      } else {
        setError('Login failed. Please try again or contact support.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcf9]">
      <header className="py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fa-solid fa-gavel text-brand-navy text-2xl"></i>
              <span className="text-2xl font-serif font-bold text-brand-navy">Witnex</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/signup" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Find Experts</Link>
              <Link to="/pricing" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Pricing</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-brand-gold font-semibold">Log In</Link>
              <Link to="/signup" className="bg-brand-navy text-white px-6 py-2 rounded-lg shadow-sm hover:bg-brand-charcoal transition-all duration-300">Sign Up</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-6xl w-full mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-serif font-bold text-brand-navy leading-tight">Welcome Back to Your Expert Network</h1>
                <p className="mt-4 text-lg text-brand-slate">Access your dashboard to search for expert witnesses, manage your cases, and connect with industry-leading professionals.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-search text-brand-gold text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-brand-navy">Advanced Search</h3>
                  <p className="text-sm text-brand-slate mt-2">Find experts by specialty, location, and experience</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-users text-brand-gold text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-brand-navy">Expert Profiles</h3>
                  <p className="text-sm text-brand-slate mt-2">Detailed profiles with credentials and testimonials</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-handshake text-brand-gold text-xl"></i>
                  </div>
                  <h3 className="font-semibold text-brand-navy">Direct Contact</h3>
                  <p className="text-sm text-brand-slate mt-2">Connect directly with verified expert witnesses</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-subtle">
                <div className="flex items-start space-x-4">
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="Client" className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="text-brand-charcoal italic">"Witnex has transformed how we find and work with expert witnesses. The platform is intuitive and the quality of experts is exceptional."</p>
                    <p className="mt-2 text-sm font-semibold text-brand-navy">Sarah Chen, Partner at Morrison & Associates</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lift p-8 lg:p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Sign In to Your Account</h2>
                <p className="mt-2 text-brand-slate">Access your expert witness dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-brand-charcoal mb-2">Email Address</label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-slate"></i>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-brand-charcoal mb-2">Password</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-slate"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all duration-300"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-slate hover:text-brand-charcoal"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold" />
                    <span className="ml-2 text-sm text-brand-charcoal">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-brand-gold hover:text-brand-gold-light font-semibold">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-navy text-white font-semibold py-3 rounded-lg hover:bg-brand-charcoal transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Signing In...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-brand-slate">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <i className="fa-brands fa-google text-red-500 mr-3"></i>
                  <span className="text-brand-charcoal font-semibold">Continue with Google</span>
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <i className="fa-brands fa-microsoft text-blue-600 mr-3"></i>
                  <span className="text-brand-charcoal font-semibold">Continue with Microsoft</span>
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-brand-slate">Don't have an account? <Link to="/signup" className="text-brand-gold hover:text-brand-gold-light font-semibold">Sign up for free</Link></p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-brand-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-gavel text-white text-xl"></i>
              <span className="text-xl font-serif font-bold">Witnex</span>
            </div>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors text-sm">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
