import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import NotificationDropdown from '../components/NotificationDropdown';
import MessagesTab from '../components/MessagesTab';

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
  contactStatus?: 'green' | 'yellow' | 'red';
  contactEmail?: string;
  contactPhone?: string;
  linkedinUrl?: string;
  profileUrl?: string;
}

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'experts');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('Any Time');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [caseAnalysis, setCaseAnalysis] = useState<any>(null);
  const [savedExpertIds, setSavedExpertIds] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minExperience: '',
    maxExperience: '',
    trialTestimony: '',
    minRate: '',
    maxRate: '',
    languages: [] as string[],
    certifications: '',
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({ full_name: '', avatar_url: null });
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetchSavedExperts();
    fetchUserProfile();
  }, []);

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

  const fetchSavedExperts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_experts')
        .select('expert_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const ids = new Set(data.map((item: any) => item.expert_id));
      setSavedExpertIds(ids);
    } catch (error) {
      console.error('Error fetching saved experts:', error);
    }
  };

  const toggleSaveExpert = async (expert: Expert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage('Please log in to save experts');
        return;
      }

      const isSaved = savedExpertIds.has(expert.id);

      if (isSaved) {
        const { error } = await supabase
          .from('saved_experts')
          .delete()
          .eq('user_id', user.id)
          .eq('expert_id', expert.id);

        if (error) throw error;

        setSavedExpertIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(expert.id);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('saved_experts')
          .insert({
            user_id: user.id,
            expert_id: expert.id,
            expert_data: expert
          });

        if (error) throw error;

        setSavedExpertIds(prev => new Set([...prev, expert.id]));
      }
    } catch (error) {
      console.error('Error toggling saved expert:', error);
      setErrorMessage('Failed to save expert. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !caseDescription.trim()) {
      setErrorMessage('Please enter a search query or case description');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');
    setHasSearched(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-experts`;

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const searchParams: any = {
        query: searchQuery,
        caseDescription: caseDescription || undefined,
        specialty: selectedSpecialty !== 'All Specialties' ? selectedSpecialty : undefined,
        location: selectedLocation || undefined,
        availability: selectedAvailability !== 'Any Time' ? selectedAvailability : undefined,
      };

      if (advancedFilters.minExperience) searchParams.minExperience = advancedFilters.minExperience;
      if (advancedFilters.maxExperience) searchParams.maxExperience = advancedFilters.maxExperience;
      if (advancedFilters.trialTestimony) searchParams.trialTestimony = advancedFilters.trialTestimony;
      if (advancedFilters.minRate) searchParams.minRate = advancedFilters.minRate;
      if (advancedFilters.maxRate) searchParams.maxRate = advancedFilters.maxRate;
      if (advancedFilters.languages.length > 0) searchParams.languages = advancedFilters.languages;
      if (advancedFilters.certifications) searchParams.certifications = advancedFilters.certifications;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setExperts(data.experts || []);
      setCaseAnalysis(data.caseAnalysis || null);
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to search experts');
      setExperts([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9]">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 lg:px-8 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <i className="fa-solid fa-gavel text-brand-navy text-2xl"></i>
                <span className="text-2xl font-serif font-bold text-brand-navy">Witnex</span>
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`transition-colors duration-300 ${activeTab === 'overview' ? 'text-brand-gold font-semibold' : 'text-brand-charcoal hover:text-brand-gold'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('experts')}
                  className={`transition-colors duration-300 ${activeTab === 'experts' ? 'text-brand-gold font-semibold' : 'text-brand-charcoal hover:text-brand-gold'}`}
                >
                  Find Experts
                </button>
                <button
                  onClick={() => setActiveTab('searches')}
                  className={`transition-colors duration-300 ${activeTab === 'searches' ? 'text-brand-gold font-semibold' : 'text-brand-charcoal hover:text-brand-gold'}`}
                >
                  My Searches
                </button>
                <Link
                  to="/saved-experts"
                  className="transition-colors duration-300 text-brand-charcoal hover:text-brand-gold"
                >
                  Saved Experts
                </Link>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`transition-colors duration-300 ${activeTab === 'messages' ? 'text-brand-gold font-semibold' : 'text-brand-charcoal hover:text-brand-gold'}`}
                >
                  Messages
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <div className="relative group">
                <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="User" className="w-10 h-10 rounded-full border-2 border-brand-gold object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-brand-gold bg-brand-gold text-white flex items-center justify-center font-semibold">
                      {(userProfile.full_name || userEmail || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-brand-navy">{userProfile.full_name || userEmail || 'User'}</p>
                    <p className="text-xs text-brand-slate">Member</p>
                  </div>
                  <i className="fa-solid fa-chevron-down text-brand-slate text-sm"></i>
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-48 bg-white rounded-lg shadow-lift border border-gray-200">
                    <Link to="/profile" className="block px-4 py-3 text-sm text-brand-charcoal hover:bg-brand-gray-light transition-colors rounded-t-lg">
                      <i className="fa-solid fa-user mr-2"></i>Profile
                    </Link>
                    <Link to="/settings" className="block px-4 py-3 text-sm text-brand-charcoal hover:bg-brand-gray-light transition-colors">
                      <i className="fa-solid fa-gear mr-2"></i>Settings
                    </Link>
                    <Link to="/billing" className="block px-4 py-3 text-sm text-brand-charcoal hover:bg-brand-gray-light transition-colors">
                      <i className="fa-solid fa-credit-card mr-2"></i>Billing
                    </Link>
                    <hr className="my-1" />
                    <Link to="/admin" className="block px-4 py-3 text-sm text-brand-charcoal hover:bg-brand-gray-light transition-colors">
                      <i className="fa-solid fa-shield-halved mr-2"></i>Admin Panel
                    </Link>
                    <hr className="my-1" />
                    <Link to="/login" className="block px-4 py-3 text-sm text-red-600 hover:bg-brand-gray-light transition-colors rounded-b-lg">
                      <i className="fa-solid fa-right-from-bracket mr-2"></i>Log Out
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {activeTab === 'experts' && (
        <>
          <section className="bg-gradient-to-br from-brand-navy to-brand-charcoal py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-serif font-bold text-white">Find Expert Witnesses</h1>
                  <p className="mt-2 text-lg text-gray-300">Search thousands of verified experts across all specialties</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                  <p className="text-sm text-gray-300">Your Plan</p>
                  <p className="text-2xl font-bold text-white">Member</p>
                  <p className="text-xs text-brand-gold-light mt-1">Unlimited searches</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-brand-charcoal mb-2">Search Query</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., medical malpractice, forensic accounting, construction defects..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-brand-charcoal mb-2">
                  Describe Your Case Needs <span className="text-brand-slate font-normal">(Optional)</span>
                </label>
                <textarea
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  placeholder="Paste a detailed description of your case or legal matter. Our AI will analyze it to find the most relevant expert witnesses for your specific needs..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none resize-none"
                />
                <p className="mt-1 text-xs text-brand-slate">
                  <i className="fa-solid fa-lightbulb mr-1"></i>
                  Tip: Include key details like the type of case, specific issues, jurisdiction, or required expertise for better results
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-charcoal mb-2">Specialty</label>
                  <div className="relative">
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none appearance-none bg-white"
                    >
                      <option>All Specialties</option>
                      <option>Medical - General</option>
                      <option>Medical - Orthopedics</option>
                      <option>Medical - Neurology</option>
                      <option>Engineering - Civil</option>
                      <option>Engineering - Mechanical</option>
                      <option>Financial Services</option>
                      <option>Forensic Accounting</option>
                      <option>Real Estate</option>
                      <option>Technology - Cybersecurity</option>
                      <option>Construction</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-brand-slate pointer-events-none"></i>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-charcoal mb-2">Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="City, State or ZIP"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                    />
                    <i className="fa-solid fa-location-dot absolute right-4 top-1/2 transform -translate-y-1/2 text-brand-slate pointer-events-none"></i>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-charcoal mb-2">Availability</label>
                  <div className="relative">
                    <select
                      value={selectedAvailability}
                      onChange={(e) => setSelectedAvailability(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none appearance-none bg-white"
                    >
                      <option>Any Time</option>
                      <option>Within 1 Week</option>
                      <option>Within 2 Weeks</option>
                      <option>Within 1 Month</option>
                      <option>Within 3 Months</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-brand-slate pointer-events-none"></i>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-brand-gold text-white font-semibold py-3 rounded-lg hover:bg-brand-gold-light transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>Searching...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-search mr-2"></i>Search Experts
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2 rounded-lg bg-brand-gray-light text-brand-charcoal text-sm font-semibold hover:bg-brand-gold hover:text-white transition-colors duration-300"
                >
                  <i className="fa-solid fa-sliders mr-2"></i>
                  {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                </button>
              </div>

              {showAdvancedFilters && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-brand-navy mb-4">Advanced Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-brand-charcoal mb-2">Experience (Years)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={advancedFilters.minExperience}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, minExperience: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={advancedFilters.maxExperience}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxExperience: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-charcoal mb-2">Trial Testimony Experience</label>
                      <select
                        value={advancedFilters.trialTestimony}
                        onChange={(e) => setAdvancedFilters({ ...advancedFilters, trialTestimony: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                      >
                        <option value="">No preference</option>
                        <option value="yes">Required</option>
                        <option value="no">Not required</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-charcoal mb-2">Hourly Rate ($)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={advancedFilters.minRate}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, minRate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={advancedFilters.maxRate}
                          onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxRate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-charcoal mb-2">Additional Languages</label>
                      <input
                        type="text"
                        placeholder="e.g., Spanish, Mandarin"
                        value={advancedFilters.languages.join(', ')}
                        onChange={(e) => setAdvancedFilters({ ...advancedFilters, languages: e.target.value.split(',').map(l => l.trim()).filter(l => l) })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-charcoal mb-2">Certifications</label>
                      <input
                        type="text"
                        placeholder="Board certified, etc."
                        value={advancedFilters.certifications}
                        onChange={(e) => setAdvancedFilters({ ...advancedFilters, certifications: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => setAdvancedFilters({
                          minExperience: '',
                          maxExperience: '',
                          trialTestimony: '',
                          minRate: '',
                          maxRate: '',
                          languages: [],
                          certifications: '',
                        })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-brand-charcoal hover:bg-brand-gray-light transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="py-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              {errorMessage && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800">
                    <i className="fa-solid fa-exclamation-circle mr-2"></i>
                    {errorMessage}
                  </p>
                </div>
              )}

              {caseAnalysis && (
                <div className="mb-6 p-6 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <i className="fa-solid fa-lightbulb text-blue-600 text-xl mt-1"></i>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brand-navy mb-3">AI Case Analysis</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-semibold text-brand-charcoal">Core Issue: </span>
                          <span className="text-brand-slate">{caseAnalysis.coreConflict}</span>
                        </div>
                        {caseAnalysis.caseType && (
                          <div>
                            <span className="font-semibold text-brand-charcoal">Case Type: </span>
                            <span className="text-brand-slate">{caseAnalysis.caseType}</span>
                          </div>
                        )}
                        {caseAnalysis.suggestedSpecialties && caseAnalysis.suggestedSpecialties.length > 0 && (
                          <div>
                            <span className="font-semibold text-brand-charcoal">Recommended Expert Types: </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {caseAnalysis.suggestedSpecialties.map((specialty: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-brand-gold text-white text-xs rounded-full">
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {caseAnalysis.keyIssues && caseAnalysis.keyIssues.length > 0 && (
                          <div>
                            <span className="font-semibold text-brand-charcoal">Key Issues Identified: </span>
                            <ul className="list-disc list-inside mt-1 text-brand-slate">
                              {caseAnalysis.keyIssues.map((issue: string, index: number) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!hasSearched ? (
                <div className="bg-white rounded-xl shadow-subtle p-12 text-center">
                  <i className="fa-solid fa-search text-brand-gold text-6xl mb-4"></i>
                  <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">Search for Expert Witnesses</h2>
                  <p className="text-brand-slate">Enter a search query above to find expert witnesses for your case.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-brand-navy">Search Results</h2>
                      <p className="text-sm text-brand-slate mt-1">
                        {isSearching ? 'Searching...' : `Showing ${experts.length} expert witnesses`}
                      </p>
                    </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select className="px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-gold focus:outline-none appearance-none bg-white pr-10">
                      <option>Sort by: Relevance</option>
                      <option>Sort by: Rating</option>
                      <option>Sort by: Experience</option>
                      <option>Sort by: Availability</option>
                      <option>Sort by: Rate (Low to High)</option>
                      <option>Sort by: Rate (High to Low)</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-slate pointer-events-none"></i>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-brand-gray-light transition-colors duration-300">
                    <i className="fa-solid fa-list"></i>
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-brand-gray-light transition-colors duration-300">
                    <i className="fa-solid fa-th"></i>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-brand-charcoal mb-2">Contact Availability Legend:</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-brand-slate"><strong>Direct Contact:</strong> Email or phone available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-brand-slate"><strong>Profile Available:</strong> LinkedIn or professional profile found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-brand-slate"><strong>Limited Contact:</strong> No direct contact path available</span>
                  </div>
                </div>
              </div>
              </div>

              {experts.length === 0 && !isSearching ? (
                <div className="bg-white rounded-xl shadow-subtle p-12 text-center">
                  <i className="fa-solid fa-user-slash text-brand-slate text-6xl mb-4"></i>
                  <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">No Experts Found</h2>
                  <p className="text-brand-slate">Try adjusting your search query or filters to find more results.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {experts.map((expert, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-subtle p-6 hover:shadow-lift transition-all duration-300 border border-transparent hover:border-brand-gold">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <img src={expert.image} alt={expert.name} className="w-24 h-24 rounded-lg object-cover" />
                      </div>
                      <div className="ml-6 flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-semibold text-brand-navy">{expert.name}</h3>
                              {expert.contactStatus === 'green' && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-300 rounded-full">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs font-semibold text-green-700">Direct Contact</span>
                                </div>
                              )}
                              {expert.contactStatus === 'yellow' && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 border border-yellow-300 rounded-full">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span className="text-xs font-semibold text-yellow-700">Profile Available</span>
                                </div>
                              )}
                              {expert.contactStatus === 'red' && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-300 rounded-full">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-xs font-semibold text-red-700">Limited Contact</span>
                                </div>
                              )}
                            </div>
                            <p className="text-brand-slate">{expert.specialty} • {expert.category}</p>
                            <div className="flex items-center mt-2 space-x-4">
                              <div className="flex items-center">
                                <i className="fa-solid fa-star text-brand-gold"></i>
                                <span className="ml-1 text-sm font-semibold text-brand-charcoal">{expert.rating}</span>
                                <span className="ml-1 text-sm text-brand-slate">({expert.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center text-sm text-brand-slate">
                                <i className="fa-solid fa-location-dot mr-1"></i>
                                {expert.location}
                              </div>
                              <div className="flex items-center text-sm text-brand-slate">
                                <i className="fa-solid fa-briefcase mr-1"></i>
                                {expert.experience} experience
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-brand-navy">{expert.rate}</p>
                            <span className={`inline-block mt-2 px-3 py-1 ${expert.availabilityColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} text-xs font-semibold rounded-full`}>
                              {expert.availability}
                            </span>
                          </div>
                        </div>
                        <p className="mt-4 text-brand-charcoal text-sm">{expert.description}</p>

                        {expert.contactStatus === 'green' && (expert.contactEmail || expert.contactPhone) && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs font-semibold text-green-800 mb-2">
                              <i className="fa-solid fa-check-circle mr-1"></i>
                              Official Contact Information Available
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              {expert.contactEmail && (
                                <a href={`mailto:${expert.contactEmail}`} className="text-green-700 hover:text-green-900 flex items-center gap-1">
                                  <i className="fa-solid fa-envelope"></i>
                                  {expert.contactEmail}
                                </a>
                              )}
                              {expert.contactPhone && (
                                <a href={`tel:${expert.contactPhone}`} className="text-green-700 hover:text-green-900 flex items-center gap-1">
                                  <i className="fa-solid fa-phone"></i>
                                  {expert.contactPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {expert.contactStatus === 'yellow' && (expert.linkedinUrl || expert.profileUrl) && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs font-semibold text-yellow-800 mb-2">
                              <i className="fa-solid fa-user-circle mr-1"></i>
                              Professional Profile Found - Manual Outreach Required
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              {expert.linkedinUrl && (
                                <a href={expert.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-700 hover:text-yellow-900 flex items-center gap-1">
                                  <i className="fa-brands fa-linkedin"></i>
                                  LinkedIn Profile
                                </a>
                              )}
                              {expert.profileUrl && (
                                <a href={expert.profileUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-700 hover:text-yellow-900 flex items-center gap-1">
                                  <i className="fa-solid fa-link"></i>
                                  Professional Profile
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {expert.contactStatus === 'red' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-semibold text-red-800">
                              <i className="fa-solid fa-info-circle mr-1"></i>
                              Limited contact information - View profile for more details
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {expert.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-3 py-1 bg-brand-gray-light text-brand-charcoal text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <Link
                            to="/expert-profile"
                            state={{ expert }}
                            className="px-6 py-2 bg-brand-gold text-white rounded-lg font-semibold hover:bg-brand-gold-light transition-colors duration-300"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => toggleSaveExpert(expert)}
                            className={`px-4 py-2 bg-white border rounded-lg transition-colors duration-300 ${
                              savedExpertIds.has(expert.id)
                                ? 'border-red-500 text-red-500 hover:bg-red-50'
                                : 'border-gray-300 text-brand-charcoal hover:bg-brand-gray-light'
                            }`}
                            title={savedExpertIds.has(expert.id) ? 'Unsave expert' : 'Save expert'}
                          >
                            <i className={savedExpertIds.has(expert.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {experts.length > 0 && (
                <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  <button className="px-4 py-2 rounded-lg border border-gray-300 text-brand-slate hover:bg-brand-gray-light transition-colors duration-300">
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-brand-gold text-white font-semibold">1</button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 text-brand-charcoal hover:bg-brand-gray-light transition-colors duration-300">2</button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 text-brand-charcoal hover:bg-brand-gray-light transition-colors duration-300">3</button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 text-brand-charcoal hover:bg-brand-gray-light transition-colors duration-300">4</button>
                  <button className="px-4 py-2 rounded-lg border border-gray-300 text-brand-slate hover:bg-brand-gray-light transition-colors duration-300">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </nav>
                </div>
              )}
                </>
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === 'overview' && (
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-brand-navy">
              Welcome back{userProfile.full_name ? `, ${userProfile.full_name}` : ''}
            </h1>
            <p className="mt-2 text-brand-slate">Here's what's happening with your expert witness network today.</p>
          </div>

          <div className="bg-white rounded-xl shadow-subtle p-8 text-center">
            <i className="fa-solid fa-chart-line text-brand-gold text-6xl mb-4"></i>
            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">Dashboard Overview</h2>
            <p className="text-brand-slate mb-6">Your account statistics and activity will appear here.</p>
            <button
              onClick={() => setActiveTab('experts')}
              className="bg-brand-gold text-white font-semibold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors duration-300"
            >
              <i className="fa-solid fa-search mr-2"></i>Start Searching for Experts
            </button>
          </div>
        </main>
      )}

      {activeTab === 'messages' && <MessagesTab />}

      {activeTab !== 'experts' && activeTab !== 'overview' && activeTab !== 'messages' && (
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-subtle p-12 text-center">
            <i className="fa-solid fa-construction text-brand-gold text-6xl mb-4"></i>
            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-2">Coming Soon</h2>
            <p className="text-brand-slate">This section is currently under development.</p>
          </div>
        </main>
      )}
    </div>
  );
}
