import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        ]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
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
              <Link to="/login" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Log In</Link>
              <Link to="/signup" className="bg-brand-navy text-white px-6 py-2 rounded-lg shadow-sm hover:bg-brand-charcoal transition-all duration-300">Sign Up</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-brand-navy">Contact Us</h1>
            <p className="mt-4 text-lg text-brand-slate">Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-subtle p-6 text-center">
              <div className="w-16 h-16 bg-brand-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-envelope text-brand-gold text-2xl"></i>
              </div>
              <h3 className="font-semibold text-brand-navy mb-2">Email Us</h3>
              <p className="text-brand-slate text-sm">support@witnex.com</p>
            </div>

            <div className="bg-white rounded-xl shadow-subtle p-6 text-center">
              <div className="w-16 h-16 bg-brand-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-phone text-brand-gold text-2xl"></i>
              </div>
              <h3 className="font-semibold text-brand-navy mb-2">Call Us</h3>
              <p className="text-brand-slate text-sm">1-800-WITNEX</p>
            </div>

            <div className="bg-white rounded-xl shadow-subtle p-6 text-center">
              <div className="w-16 h-16 bg-brand-gold bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-clock text-brand-gold text-2xl"></i>
              </div>
              <h3 className="font-semibold text-brand-navy mb-2">Business Hours</h3>
              <p className="text-brand-slate text-sm">Mon-Fri: 9am-6pm EST</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lift p-8 lg:p-12">
            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Send us a Message</h2>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-check-circle text-green-600"></i>
                  <p className="text-green-800 font-medium">Thank you for contacting us! We'll get back to you soon.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-exclamation-circle text-red-600"></i>
                  <p className="text-red-800 font-medium">Error: {errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-brand-navy mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-brand-navy mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-brand-navy mb-2">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200"
                >
                  <option value="">Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing Question">Billing Question</option>
                  <option value="Expert Verification">Expert Verification</option>
                  <option value="Partnership Opportunity">Partnership Opportunity</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-brand-navy mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 transition-all duration-200 resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-gold text-white font-semibold py-4 rounded-lg hover:bg-brand-gold-light transition-colors duration-300 transform hover:-translate-y-0.5 shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-brand-navy text-white mt-16">
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
                <li><Link to="/signup" className="text-brand-gray-medium hover:text-white transition-colors">Find an Expert</Link></li>
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">For Law Firms</a></li>
                <li><a href="/expert-signup" className="text-brand-gray-medium hover:text-white transition-colors">For Experts</a></li>
                <li><Link to="/pricing" className="text-brand-gray-medium hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold tracking-wider uppercase">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-brand-gray-medium hover:text-white transition-colors">Blog</a></li>
                <li><Link to="/contact" className="text-brand-gray-medium hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-brand-slate pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-brand-gray-medium text-sm">&copy; 2026 Witnex. All Rights Reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="text-brand-gray-medium hover:text-white transition-colors"><i className="fa-brands fa-facebook-f"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
