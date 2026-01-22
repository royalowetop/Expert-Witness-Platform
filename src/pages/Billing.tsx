import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import NotificationDropdown from '../components/NotificationDropdown';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface UserProfile {
  full_name: string;
  firm_name: string | null;
  practice_area: string | null;
}

const invoices = [
  { id: 1, date: 'Feb 15, 2025', description: 'Practice Team Plan', amount: '$299.00', status: 'Paid' },
  { id: 2, date: 'Jan 15, 2025', description: 'Practice Team Plan', amount: '$299.00', status: 'Paid' },
  { id: 3, date: 'Dec 15, 2024', description: 'Practice Team Plan', amount: '$299.00', status: 'Paid' },
  { id: 4, date: 'Nov 15, 2024', description: 'Practice Team Plan', amount: '$299.00', status: 'Paid' },
  { id: 5, date: 'Oct 15, 2024', description: 'Practice Team Plan', amount: '$299.00', status: 'Paid' },
];

export default function Billing() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      setUserEmail(user.email || '');

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('full_name, firm_name, practice_area')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fdfcf9] min-h-screen flex">
      <aside className="w-64 bg-brand-navy text-white flex-shrink-0 relative">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <i className="fa-solid fa-gavel text-white text-2xl"></i>
            <span className="text-2xl font-serif font-bold">Witnex</span>
          </Link>
        </div>

        <nav className="mt-8">
          <Link to="/dashboard" className="flex items-center px-6 py-3 text-brand-gray-medium hover:bg-brand-charcoal hover:text-white transition-colors">
            <i className="fa-solid fa-house w-5"></i>
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link to="/dashboard" className="flex items-center px-6 py-3 text-brand-gray-medium hover:bg-brand-charcoal hover:text-white transition-colors">
            <i className="fa-solid fa-magnifying-glass w-5"></i>
            <span className="ml-3">Search Experts</span>
          </Link>
          <Link to="/saved-experts" className="flex items-center px-6 py-3 text-brand-gray-medium hover:bg-brand-charcoal hover:text-white transition-colors">
            <i className="fa-solid fa-star w-5"></i>
            <span className="ml-3">Saved Experts</span>
          </Link>
          <a href="#" className="flex items-center px-6 py-3 text-brand-gray-medium hover:bg-brand-charcoal hover:text-white transition-colors">
            <i className="fa-solid fa-folder-open w-5"></i>
            <span className="ml-3">My Cases</span>
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-brand-gray-medium hover:bg-brand-charcoal hover:text-white transition-colors">
            <i className="fa-solid fa-clock-rotate-left w-5"></i>
            <span className="ml-3">Search History</span>
          </a>
          <Link to="/billing" className="flex items-center px-6 py-3 bg-brand-charcoal text-white border-l-4 border-brand-gold">
            <i className="fa-solid fa-credit-card w-5"></i>
            <span className="ml-3">Billing</span>
          </Link>
          <Link to="/settings" className="flex items-center px-6 py-3 text-brand-gray-medium hover:bg-brand-charcoal hover:text-white transition-colors">
            <i className="fa-solid fa-gear w-5"></i>
            <span className="ml-3">Settings</span>
          </Link>
          <Link to="/profile" className="flex items-center px-6 py-3 text-brand-gray-medium hover:bg-brand-charcoal hover:text-white transition-colors">
            <i className="fa-solid fa-user w-5"></i>
            <span className="ml-3">Profile</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-brand-charcoal">
          {!isLoading && profile && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-white font-semibold">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{profile.full_name || 'User'}</p>
                <p className="text-xs text-brand-gray-medium truncate">{profile.practice_area || profile.firm_name || 'Attorney'}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-navy">Billing & Subscription</h1>
              <p className="text-sm text-brand-slate mt-1">Manage your payment information and subscription plan</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <button className="text-brand-slate hover:text-brand-navy">
                <i className="fa-solid fa-circle-question text-xl"></i>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl">
            <div className="bg-gradient-to-r from-brand-navy to-brand-charcoal rounded-xl p-8 text-white mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-serif font-bold">Practice Team Plan</h2>
                    <span className="bg-brand-gold px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                  </div>
                  <p className="mt-2 text-gray-300">Your subscription renews on March 15, 2025</p>
                  <div className="mt-4 flex items-baseline space-x-2">
                    <span className="text-4xl font-bold">$299</span>
                    <span className="text-gray-300">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">Billed monthly • 5 user seats included</p>
                </div>
                <div className="text-right">
                  <Link to="/pricing" className="bg-white text-brand-navy px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">Change Plan</Link>
                  <button className="mt-2 block text-sm text-gray-300 hover:text-white">Cancel Subscription</button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-4 gap-6">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Searches This Month</p>
                  <p className="text-2xl font-bold mt-1">147</p>
                  <p className="text-xs text-gray-400 mt-1">Unlimited available</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Active Users</p>
                  <p className="text-2xl font-bold mt-1">4 / 5</p>
                  <p className="text-xs text-gray-400 mt-1">1 seat available</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Saved Experts</p>
                  <p className="text-2xl font-bold mt-1">28</p>
                  <p className="text-xs text-gray-400 mt-1">Across all cases</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-sm text-gray-300">Next Billing</p>
                  <p className="text-2xl font-bold mt-1">$299</p>
                  <p className="text-xs text-gray-400 mt-1">Due Mar 15, 2025</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-8">
                <div className="bg-white rounded-xl shadow-subtle p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-brand-navy">Payment Method</h3>
                    <button className="text-brand-gold hover:text-brand-gold-light font-semibold text-sm">+ Add New Card</button>
                  </div>

                  <div className="border-2 border-brand-gold rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white mb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-brand-navy rounded-lg flex items-center justify-center">
                          <i className="fa-brands fa-cc-visa text-white text-2xl"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-brand-navy">Visa ending in 4242</p>
                          <p className="text-sm text-brand-slate">Expires 12/2026</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-brand-gold text-white text-xs px-2 py-1 rounded">Primary</span>
                        <button className="text-brand-slate hover:text-brand-navy"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-brand-charcoal rounded-lg flex items-center justify-center">
                          <i className="fa-brands fa-cc-mastercard text-white text-2xl"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-brand-navy">Mastercard ending in 8888</p>
                          <p className="text-sm text-brand-slate">Expires 09/2025</p>
                        </div>
                      </div>
                      <button className="text-brand-slate hover:text-brand-navy"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-subtle p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-brand-navy">Billing History</h3>
                    <button className="text-brand-gold hover:text-brand-gold-light font-semibold text-sm">Download All</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 text-sm font-semibold text-brand-slate">Date</th>
                          <th className="text-left py-3 text-sm font-semibold text-brand-slate">Description</th>
                          <th className="text-left py-3 text-sm font-semibold text-brand-slate">Amount</th>
                          <th className="text-left py-3 text-sm font-semibold text-brand-slate">Status</th>
                          <th className="text-right py-3 text-sm font-semibold text-brand-slate">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-gray-100">
                            <td className="py-4 text-sm text-brand-charcoal">{invoice.date}</td>
                            <td className="py-4 text-sm text-brand-charcoal">{invoice.description}</td>
                            <td className="py-4 text-sm font-semibold text-brand-navy">{invoice.amount}</td>
                            <td className="py-4">
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{invoice.status}</span>
                            </td>
                            <td className="py-4 text-right">
                              <button className="text-brand-gold hover:text-brand-gold-light text-sm">
                                <i className="fa-solid fa-download mr-1"></i>PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button className="text-brand-gold hover:text-brand-gold-light font-semibold text-sm">View All Invoices</button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-brand-gold to-brand-gold-light rounded-xl p-6 text-white">
                  <i className="fa-solid fa-rocket text-3xl mb-4"></i>
                  <h3 className="text-xl font-semibold">Upgrade to Professional</h3>
                  <p className="mt-2 text-sm text-white text-opacity-90">Get advanced analytics, 20 user seats, and custom expert vetting.</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center"><i className="fa-solid fa-check mr-2"></i>Advanced analytics</li>
                    <li className="flex items-center"><i className="fa-solid fa-check mr-2"></i>20 user seats</li>
                    <li className="flex items-center"><i className="fa-solid fa-check mr-2"></i>Phone support</li>
                  </ul>
                  <Link to="/pricing" className="mt-6 w-full bg-white text-brand-gold font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors block text-center">View Plans</Link>
                </div>

                <div className="bg-white rounded-xl shadow-subtle p-6">
                  <h3 className="text-lg font-semibold text-brand-navy mb-4">Billing Information</h3>
                  <div className="space-y-3">
                    {profile?.firm_name && (
                      <div>
                        <p className="text-xs text-brand-slate">Company Name</p>
                        <p className="text-sm font-semibold text-brand-charcoal">{profile.firm_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-brand-slate">Billing Email</p>
                      <p className="text-sm font-semibold text-brand-charcoal">{userEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-slate">Address</p>
                      <p className="text-sm text-brand-charcoal text-brand-slate italic">Not yet configured</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full border border-brand-gold text-brand-gold font-semibold py-2 rounded-lg hover:bg-brand-gold hover:text-white transition-colors">Edit Information</button>
                </div>

                <div className="bg-white rounded-xl shadow-subtle p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-brand-navy">Team Members</h3>
                    <span className="text-sm text-brand-slate">1 / 5</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-white font-semibold text-sm">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-brand-charcoal">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-brand-slate">Admin</p>
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 w-full border border-gray-300 text-brand-charcoal font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">+ Add Team Member</button>
                </div>

                <div className="bg-brand-gray-light rounded-xl p-6">
                  <i className="fa-solid fa-headset text-2xl text-brand-gold mb-3"></i>
                  <h3 className="text-lg font-semibold text-brand-navy">Need Help?</h3>
                  <p className="mt-2 text-sm text-brand-slate">Our billing support team is here to assist you.</p>
                  <button className="mt-4 w-full bg-brand-navy text-white font-semibold py-2 rounded-lg hover:bg-brand-charcoal transition-colors text-sm">Contact Support</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
