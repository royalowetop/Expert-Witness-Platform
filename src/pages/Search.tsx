import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import SearchResults from '../components/SearchResults';

interface ContactInfo {
  emails: string[];
  phones: string[];
  websites: string[];
}

interface SearchResult {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishedDate?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  contactInfo?: ContactInfo;
}

interface ExaSearchResponse {
  results: SearchResult[];
  autopromptString?: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoprompt, setAutoprompt] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setAutoprompt(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exa-search`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          numResults: 10,
          useAutoprompt: true,
          extractContacts: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Search API Error:', errorData);
        throw new Error(errorData.error || 'Search failed');
      }

      const data: ExaSearchResponse = await response.json();
      console.log('Exa API Response:', data);
      setResults(data.results || []);
      setAutoprompt(data.autopromptString || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy mb-4">
            Web Search
          </h1>
          <p className="text-xl text-brand-gray-dark">
            Powered by Exa.ai - Search the web with advanced AI
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="w-full px-6 py-4 pr-14 text-lg border-2 border-brand-gray-light rounded-lg focus:outline-none focus:border-brand-gold transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-gold hover:bg-opacity-90 text-white p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SearchIcon className="w-6 h-6" />
            </button>
          </div>

          {autoprompt && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-brand-gray-dark">
                <span className="font-semibold">AI Enhanced Query:</span> {autoprompt}
              </p>
            </div>
          )}
        </form>

        <SearchResults results={results} loading={loading} error={error} />
      </div>
    </div>
  );
}
