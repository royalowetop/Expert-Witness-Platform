import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Settings() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      setUserEmail(user.email || '');
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-gold"></i>
          <p className="mt-4 text-brand-slate">Loading settings...</p>
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
            <h1 className="text-4xl font-serif font-bold text-brand-navy">Account Settings</h1>
            <p className="mt-2 text-lg text-brand-slate">Manage your account security and preferences</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                {message.text}
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lift p-8">
              <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-brand-slate cursor-not-allowed"
                  />
                  <p className="mt-2 text-xs text-brand-slate">
                    Contact support to change your email address
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lift p-8">
              <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving || !newPassword || !confirmPassword}
                    className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-brand-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>Updating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-key mr-2"></i>Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lift p-8 border-l-4 border-red-500">
              <h2 className="text-2xl font-serif font-bold text-red-600 mb-4">Danger Zone</h2>
              <p className="text-brand-slate mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <i className="fa-solid fa-trash mr-2"></i>Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
