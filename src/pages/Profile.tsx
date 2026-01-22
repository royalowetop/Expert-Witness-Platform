import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  firm_name: string | null;
  practice_area: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([{ user_id: user.id, full_name: user.email || '' }])
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          firm_name: profile.firm_name,
          practice_area: profile.practice_area,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-gold"></i>
          <p className="mt-4 text-brand-slate">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9]">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <i className="fa-solid fa-gavel text-brand-navy text-2xl"></i>
              <span className="text-2xl font-serif font-bold text-brand-navy">Witnex</span>
            </Link>
            <Link to="/dashboard" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">
              <i className="fa-solid fa-arrow-left mr-2"></i>Back to Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-brand-navy">My Profile</h1>
            <p className="mt-2 text-lg text-brand-slate">Manage your personal and professional information</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                {message.text}
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lift p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-navy mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">Firm Name</label>
                  <input
                    type="text"
                    value={profile?.firm_name || ''}
                    onChange={(e) => setProfile({ ...profile!, firm_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                    placeholder="Doe & Associates"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">Practice Area</label>
                  <input
                    type="text"
                    value={profile?.practice_area || ''}
                    onChange={(e) => setProfile({ ...profile!, practice_area: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                    placeholder="Personal Injury"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile({ ...profile!, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">Location</label>
                  <input
                    type="text"
                    value={profile?.location || ''}
                    onChange={(e) => setProfile({ ...profile!, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                    placeholder="Los Angeles, CA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-navy mb-2">Bio</label>
                <textarea
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 resize-none"
                  placeholder="Tell us about yourself and your practice..."
                />
                <p className="mt-2 text-xs text-brand-slate">
                  Share your background, experience, and areas of expertise
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 border border-brand-navy text-brand-navy rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-brand-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save mr-2"></i>Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
