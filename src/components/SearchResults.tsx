import { ExternalLink, Loader2, Mail, Phone, Globe } from 'lucide-react';

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

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

export default function SearchResults({ results, loading, error }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-brand-navy">
        Search Results ({results.length})
      </h2>

      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="bg-white border border-brand-gray-light rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold text-brand-navy group-hover:text-brand-gold transition-colors flex-1">
                  {result.title}
                </h3>
                <ExternalLink className="w-5 h-5 text-brand-gray-medium group-hover:text-brand-gold transition-colors flex-shrink-0" />
              </div>
            </a>

            {(result.author || result.publishedDate) && (
              <div className="flex gap-4 mt-2 text-sm text-brand-gray-medium">
                {result.author && <span>{result.author}</span>}
                {result.publishedDate && (
                  <span>{new Date(result.publishedDate).toLocaleDateString()}</span>
                )}
              </div>
            )}

            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-gray-medium hover:text-brand-gold transition-colors mt-1 block"
            >
              {result.url}
            </a>

            {result.highlights && result.highlights.length > 0 && (
              <div className="mt-4 space-y-2">
                {result.highlights.slice(0, 3).map((highlight, index) => (
                  <p
                    key={index}
                    className="text-brand-gray-dark bg-brand-beige p-3 rounded border-l-4 border-brand-gold"
                    dangerouslySetInnerHTML={{ __html: highlight }}
                  />
                ))}
              </div>
            )}

            {result.text && !result.highlights && (
              <p className="mt-4 text-brand-gray-dark line-clamp-3">
                {result.text}
              </p>
            )}

            {result.contactInfo && (result.contactInfo.emails.length > 0 || result.contactInfo.phones.length > 0 || result.contactInfo.websites.length > 0) && (
              <div className="mt-4 pt-4 border-t border-brand-gray-light">
                <h4 className="text-sm font-semibold text-brand-navy mb-2">Contact Information</h4>
                <div className="space-y-2">
                  {result.contactInfo.emails.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-2">
                        {result.contactInfo.emails.map((email, index) => (
                          <a
                            key={index}
                            href={`mailto:${email}`}
                            className="text-sm text-brand-gold hover:underline"
                          >
                            {email}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.contactInfo.phones.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-2">
                        {result.contactInfo.phones.map((phone, index) => (
                          <a
                            key={index}
                            href={`tel:${phone}`}
                            className="text-sm text-brand-gold hover:underline"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.contactInfo.websites.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-2">
                        {result.contactInfo.websites.slice(0, 3).map((website, index) => (
                          <a
                            key={index}
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-brand-gold hover:underline truncate max-w-xs"
                          >
                            {website}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
