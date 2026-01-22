import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import NotificationDropdown from '../components/NotificationDropdown';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Expert {
  id: string;
  name: string;
  specialty: string;
  category: string;
  image?: string;
  rating: number;
  reviews: number;
  location: string;
  experience: string;
  rate: string;
  availability: string;
  availabilityColor: string;
  description: string;
  tags: string[];
  url?: string;
  caseCount?: number;
  languages?: string[];
  certifications?: string[];
  education?: string[];
}

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
}

export default function ExpertProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const expert = (location.state as { expert?: Expert })?.expert;
  const [userProfile, setUserProfile] = useState<UserProfile>({ full_name: '', avatar_url: null });
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!expert) {
      navigate('/dashboard');
      return;
    }
    fetchUserProfile();
  }, [expert, navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || '');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  if (!expert) {
    return null;
  }

  const experienceYears = expert.experience.replace(' years', '').replace('+ Years', '');
  const hourlyRate = expert.rate.replace('$', '').replace('/hr', '');

  return (
    <div className="min-h-screen bg-[#fdfcf9]">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fa-solid fa-gavel text-brand-navy text-2xl"></i>
              <span className="text-2xl font-serif font-bold text-brand-navy">Witnex</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="text-brand-gold font-semibold">Find Experts</Link>
              <Link to="/pricing" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Pricing</Link>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-brand-gold" />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-brand-gold bg-brand-gold text-white flex items-center justify-center font-semibold">
                  {(userProfile.full_name || userEmail || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-brand-slate">
            <Link to="/dashboard" className="hover:text-brand-gold transition-colors">Dashboard</Link>
            <i className="fa-solid fa-chevron-right text-xs"></i>
            <Link to="/dashboard" className="hover:text-brand-gold transition-colors">Search Results</Link>
            <i className="fa-solid fa-chevron-right text-xs"></i>
            <span className="text-brand-charcoal font-medium">Expert Profile</span>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              {expert.image ? (
                <img src={expert.image} alt={expert.name} className="w-48 h-48 rounded-xl object-cover shadow-lift" />
              ) : (
                <div className="w-48 h-48 rounded-xl bg-brand-gold text-white flex items-center justify-center text-6xl font-bold shadow-lift">
                  {expert.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-serif font-bold text-brand-navy">{expert.name}</h1>
                  <p className="mt-2 text-xl text-brand-slate">{expert.specialty}</p>
                  <div className="mt-4 flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fa-solid fa-star ${i < Math.floor(expert.rating) ? 'text-brand-gold' : 'text-gray-300'}`}></i>
                        ))}
                      </div>
                      <span className="text-brand-charcoal font-semibold">{expert.rating.toFixed(1)}</span>
                      <span className="text-brand-slate">({expert.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-brand-slate">
                      <i className="fa-solid fa-briefcase"></i>
                      <span>{expert.experience} experience</span>
                    </div>
                    {expert.caseCount && (
                      <div className="flex items-center space-x-2 text-brand-slate">
                        <i className="fa-solid fa-gavel"></i>
                        <span>{expert.caseCount} cases testified</span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border-2 border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold hover:text-white transition-all duration-300">
                  <i className="fa-regular fa-heart"></i>
                  <span className="font-semibold">Save</span>
                </button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {expert.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-brand-gold bg-opacity-10 text-brand-gold rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow-subtle p-8">
                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-4">Professional Overview</h2>
                <p className="text-brand-charcoal leading-relaxed">{expert.description}</p>
                {expert.url && (
                  <a
                    href={expert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center text-brand-gold hover:text-brand-gold-light transition-colors"
                  >
                    View Source <i className="fa-solid fa-external-link ml-2"></i>
                  </a>
                )}
              </div>

              {expert.education && expert.education.length > 0 && (
                <div className="bg-white rounded-xl shadow-subtle p-8">
                  <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Education & Credentials</h2>
                  <div className="space-y-6">
                    {expert.education.map((edu, index) => (
                      <div key={index} className="flex">
                        <div className="flex-shrink-0 w-12 h-12 bg-brand-gold bg-opacity-10 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-graduation-cap text-brand-gold text-xl"></i>
                        </div>
                        <div className="ml-4">
                          <p className="text-brand-slate">{edu}</p>
                        </div>
                      </div>
                    ))}
                    {expert.certifications && expert.certifications.length > 0 && (
                      <div className="flex">
                        <div className="flex-shrink-0 w-12 h-12 bg-brand-gold bg-opacity-10 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-certificate text-brand-gold text-xl"></i>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-brand-navy">Certifications</h3>
                          {expert.certifications.map((cert, index) => (
                            <p key={index} className="text-brand-slate">{cert}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-subtle p-8">
                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Areas of Expertise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expert.tags.map((tag, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <i className="fa-solid fa-check-circle text-brand-gold mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-brand-navy">{tag}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-subtle p-6">
                <h3 className="text-xl font-serif font-bold text-brand-navy mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-location-dot text-brand-gold mt-1"></i>
                    <div>
                      <p className="font-medium text-brand-navy">Location</p>
                      <p className="text-sm text-brand-slate">{expert.location}</p>
                    </div>
                  </div>
                  {expert.languages && expert.languages.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <i className="fa-solid fa-language text-brand-gold mt-1"></i>
                      <div>
                        <p className="font-medium text-brand-navy">Languages</p>
                        <p className="text-sm text-brand-slate">{expert.languages.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
                {expert.availability && expert.availability !== 'Available' && expert.availability !== 'Unavailable' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-brand-navy mb-3">Availability</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${expert.availabilityColor === 'green' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-brand-charcoal">{expert.availability}</span>
                    </div>
                    <p className="mt-2 text-sm text-brand-slate">Typical response time: 24-48 hours</p>
                  </div>
                )}
              </div>

              {expert.rate && expert.rate !== '$0/hr' && expert.rate !== '$undefined/hr' && (
                <div className="bg-brand-gold bg-opacity-10 rounded-xl p-6">
                  <h3 className="text-xl font-serif font-bold text-brand-navy mb-4">Fee Structure</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-charcoal">Hourly Rate</span>
                      <span className="font-semibold text-brand-navy">{expert.rate}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-brand-slate">Rates are subject to change. Contact expert for detailed pricing.</p>
                </div>
              )}

              {expert.caseCount && (
                <div className="bg-white rounded-xl shadow-subtle p-6">
                  <h3 className="text-xl font-serif font-bold text-brand-navy mb-4">Case Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-brand-slate">Total Cases</span>
                        <span className="text-sm font-semibold text-brand-navy">{expert.caseCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
                <li><Link to="/pricing" className="text-brand-gray-medium hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold tracking-wider uppercase">Company</h4>
              <ul className="mt-4 space-y-3">
                <li><Link to="/about" className="text-brand-gray-medium hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-brand-gray-medium hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-brand-slate pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-brand-gray-medium text-sm">&copy; 2026 Witnex. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
