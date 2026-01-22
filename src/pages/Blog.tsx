import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <h1 className="text-4xl font-serif font-bold text-brand-navy mb-6">Blog</h1>
          <p className="text-brand-charcoal">Content coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
