import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Expert {
  id: string;
  name: string;
  specialty: string;
  category: string;
  image: string;
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
}

interface SavedExpert {
  id: string;
  expert_id: string;
  expert_data: Expert;
  created_at: string;
}

export default function SavedExperts() {
  const navigate = useNavigate();
  const [savedExperts, setSavedExperts] = useState<SavedExpert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSavedExperts();
  }, []);

  const fetchSavedExperts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('saved_experts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedExperts(data || []);
    } catch (error) {
      console.error('Error fetching saved experts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveExpert = async (expertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_experts')
        .delete()
        .eq('user_id', user.id)
        .eq('expert_id', expertId);

      if (error) throw error;

      setSavedExperts(prev => prev.filter(item => item.expert_id !== expertId));
    } catch (error) {
      console.error('Error removing expert:', error);
    }
  };

  const filteredExperts = savedExperts.filter(item => {
    if (!searchQuery) return true;
    const expert = item.expert_data;
    const query = searchQuery.toLowerCase();
    return (
      expert.name.toLowerCase().includes(query) ||
      expert.specialty.toLowerCase().includes(query) ||
      expert.location.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-gold"></i>
          <p className="mt-4 text-brand-slate">Loading saved experts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9]">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fa-solid fa-gavel text-brand-navy text-2xl"></i>
              <span className="text-2xl font-serif font-bold text-brand-navy">Witnex</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Dashboard</Link>
              <Link to="/dashboard" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Find Experts</Link>
              <Link to="/saved-experts" className="text-brand-gold font-semibold">Saved Experts</Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center space-x-2 text-brand-charcoal hover:text-brand-gold transition-colors duration-300">
                  <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-white font-semibold">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold text-brand-navy">Saved Experts</h1>
              <p className="mt-2 text-brand-slate">Manage your saved expert witnesses for future reference</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved experts..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                />
                <i className="fa-solid fa-search absolute left-3 top-3 text-brand-slate"></i>
              </div>
              <Link to="/dashboard" className="bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-charcoal transition-colors duration-300">
                <i className="fa-solid fa-plus mr-2"></i>Find More Experts
              </Link>
            </div>
          </div>
        </div>

        {savedExperts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-subtle p-12 text-center">
            <i className="fa-regular fa-heart text-brand-slate text-6xl mb-4"></i>
            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">No Saved Experts Yet</h2>
            <p className="text-brand-slate mb-6">
              Start saving expert witnesses to easily access them later.
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-brand-gold text-white px-6 py-3 rounded-lg hover:bg-brand-gold-light transition-colors duration-300"
            >
              <i className="fa-solid fa-search mr-2"></i>Search for Experts
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between bg-white rounded-lg shadow-subtle p-4">
                <span className="text-sm text-brand-slate">
                  {filteredExperts.length} saved expert{filteredExperts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {filteredExperts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-subtle p-12 text-center">
                <i className="fa-solid fa-search text-brand-slate text-6xl mb-4"></i>
                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">No Results Found</h2>
                <p className="text-brand-slate">Try adjusting your search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperts.map((item) => {
                  const expert = item.expert_data;
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow-subtle overflow-hidden hover:shadow-lift transition-shadow duration-300">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <img src={expert.image} alt={expert.name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                              <h3 className="font-semibold text-brand-navy">{expert.name}</h3>
                              <p className="text-sm text-brand-slate">{expert.specialty}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveExpert(expert.id)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-300"
                            title="Remove from saved"
                          >
                            <i className="fa-solid fa-heart"></i>
                          </button>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-brand-charcoal">
                            <i className="fa-solid fa-map-marker-alt w-4 text-brand-slate mr-2"></i>
                            <span>{expert.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-brand-charcoal">
                            <i className="fa-solid fa-star w-4 text-brand-gold mr-2"></i>
                            <span>{expert.rating} ({expert.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center text-sm text-brand-charcoal">
                            <i className="fa-solid fa-briefcase w-4 text-brand-slate mr-2"></i>
                            <span>{expert.experience}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-brand-charcoal line-clamp-2">{expert.description}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {expert.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs rounded-full bg-brand-gray-light text-brand-charcoal">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-medium text-brand-charcoal">{expert.rate}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            expert.availabilityColor === 'green'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            <i className={`fa-solid fa-circle text-xs mr-1 ${
                              expert.availabilityColor === 'green' ? 'text-green-500' : 'text-yellow-500'
                            }`}></i>
                            {expert.availability}
                          </span>
                        </div>

                        <div className="mt-4">
                          <Link
                            to="/expert-profile"
                            className="w-full block text-center bg-brand-navy text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-brand-charcoal transition-colors duration-300"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                      <div className="px-6 py-3 bg-brand-gray-light border-t">
                        <div className="flex items-center justify-center text-xs text-brand-slate">
                          <span>Saved on {formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
