import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function PrivacyPolicy() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Privacy Policy');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('document_type', 'privacy_policy')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContent(data.content);
        setTitle(data.title);
        setEffectiveDate(new Date(data.effective_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      }
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-4xl font-serif font-bold text-brand-navy mt-8 mb-4">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-serif font-bold text-brand-navy mt-6 mb-3">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-brand-navy mt-4 mb-2">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-bold text-brand-navy my-2">{line.substring(2, line.length - 2)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 my-1 text-brand-slate">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      } else {
        return <p key={index} className="text-brand-slate my-2 leading-relaxed">{line}</p>;
      }
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
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">Log In</Link>
              <Link to="/signup" className="bg-brand-navy text-white px-6 py-2 rounded-lg shadow-sm hover:bg-brand-charcoal transition-all duration-300">Sign Up</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-gold"></i>
              <p className="mt-4 text-brand-slate">Loading...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lift p-8 lg:p-12">
              <div className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-brand-navy">{title}</h1>
                {effectiveDate && (
                  <p className="mt-2 text-brand-slate">Effective Date: {effectiveDate}</p>
                )}
              </div>
              <div className="prose max-w-none">
                {renderContent(content)}
              </div>
              <div className="mt-12 pt-8 border-t border-gray-200">
                <Link to="/" className="text-brand-gold hover:text-brand-gold-light font-semibold">
                  <i className="fa-solid fa-arrow-left mr-2"></i>
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-brand-navy text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-brand-gray-medium text-sm">&copy; 2026 Witnex. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
