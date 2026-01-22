import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type DocumentType = 'terms_of_service' | 'privacy_policy';

interface LegalDocument {
  id: string;
  document_type: DocumentType;
  title: string;
  content: string;
  version: number;
  is_active: boolean;
  effective_date: string;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>('terms_of_service');
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchDocuments();
    }
  }, [selectedDoc, isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);

      if (!data) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('document_type', selectedDoc)
        .order('version', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
      const activeDoc = data?.find(doc => doc.is_active);
      if (activeDoc) {
        setEditingDoc(activeDoc);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setMessage({ type: 'error', text: 'Failed to load documents' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingDoc) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await supabase
        .from('legal_documents')
        .update({ is_active: false })
        .eq('document_type', selectedDoc)
        .eq('is_active', true);

      const maxVersion = Math.max(...documents.map(d => d.version), 0);

      const { error } = await supabase
        .from('legal_documents')
        .insert([
          {
            document_type: editingDoc.document_type,
            title: editingDoc.title,
            content: editingDoc.content,
            version: maxVersion + 1,
            is_active: true,
            effective_date: editingDoc.effective_date
          }
        ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Document saved successfully!' });
      fetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
      setMessage({ type: 'error', text: 'Failed to save document' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevertVersion = async (versionId: string) => {
    try {
      await supabase
        .from('legal_documents')
        .update({ is_active: false })
        .eq('document_type', selectedDoc)
        .eq('is_active', true);

      const { error } = await supabase
        .from('legal_documents')
        .update({ is_active: true })
        .eq('id', versionId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Version restored successfully!' });
      fetchDocuments();
    } catch (error) {
      console.error('Error reverting version:', error);
      setMessage({ type: 'error', text: 'Failed to revert version' });
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-gold"></i>
          <p className="mt-4 text-brand-slate">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
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
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-brand-charcoal hover:text-brand-gold transition-colors duration-300">
                <i className="fa-solid fa-arrow-left mr-2"></i>Back to Dashboard
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-brand-navy">Admin Panel</h1>
            <p className="mt-2 text-lg text-brand-slate">Manage legal documents and policies</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                {message.text}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lift p-6">
                <h2 className="text-xl font-serif font-bold text-brand-navy mb-4">Document Type</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedDoc('terms_of_service')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedDoc === 'terms_of_service'
                        ? 'bg-brand-gold text-white'
                        : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
                    }`}
                  >
                    <i className="fa-solid fa-file-contract mr-2"></i>
                    Terms of Service
                  </button>
                  <button
                    onClick={() => setSelectedDoc('privacy_policy')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedDoc === 'privacy_policy'
                        ? 'bg-brand-gold text-white'
                        : 'bg-gray-100 text-brand-charcoal hover:bg-gray-200'
                    }`}
                  >
                    <i className="fa-solid fa-shield-halved mr-2"></i>
                    Privacy Policy
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-brand-navy mb-4">Version History</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-3 rounded-lg border ${
                          doc.is_active
                            ? 'border-brand-gold bg-brand-gold bg-opacity-10'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm text-brand-navy">
                              Version {doc.version}
                              {doc.is_active && (
                                <span className="ml-2 text-xs bg-brand-gold text-white px-2 py-1 rounded">Active</span>
                              )}
                            </p>
                            <p className="text-xs text-brand-slate mt-1">
                              {new Date(doc.effective_date).toLocaleDateString()}
                            </p>
                          </div>
                          {!doc.is_active && (
                            <button
                              onClick={() => handleRevertVersion(doc.id)}
                              className="text-xs text-brand-gold hover:text-brand-gold-light"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="bg-white rounded-xl shadow-lift p-12 text-center">
                  <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-gold"></i>
                  <p className="mt-4 text-brand-slate">Loading...</p>
                </div>
              ) : editingDoc ? (
                <div className="bg-white rounded-xl shadow-lift p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-serif font-bold text-brand-navy">
                      Edit {selectedDoc === 'terms_of_service' ? 'Terms of Service' : 'Privacy Policy'}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-brand-navy mb-2">Document Title</label>
                      <input
                        type="text"
                        value={editingDoc.title}
                        onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-navy mb-2">Effective Date</label>
                      <input
                        type="date"
                        value={editingDoc.effective_date}
                        onChange={(e) => setEditingDoc({ ...editingDoc, effective_date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-navy mb-2">
                        Content (Markdown supported)
                      </label>
                      <textarea
                        value={editingDoc.content}
                        onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                        rows={25}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold focus:ring-opacity-20 font-mono text-sm resize-none"
                      />
                      <p className="mt-2 text-xs text-brand-slate">
                        Use # for headings, ## for subheadings, - for bullet points, ** for bold text
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <div className="text-sm text-brand-slate">
                        Current version: {editingDoc.version}
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          to={selectedDoc === 'terms_of_service' ? '/terms-of-service' : '/privacy-policy'}
                          target="_blank"
                          className="px-6 py-3 border border-brand-navy text-brand-navy rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <i className="fa-solid fa-eye mr-2"></i>Preview
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
                              <i className="fa-solid fa-save mr-2"></i>Save as New Version
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lift p-12 text-center">
                  <i className="fa-solid fa-file-circle-question text-4xl text-brand-slate mb-4"></i>
                  <p className="text-brand-slate">No document found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
