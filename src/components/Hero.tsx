export default function Hero() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative pt-20 md:pt-32 pb-12 md:pb-20 min-h-[700px] md:h-auto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8f6f1] to-white"></div>
      <div className="absolute inset-0 opacity-50" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23d1d5db%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-brand-navy leading-tight">Find the Perfect Expert Witness in Seconds</h1>
        <p className="mt-3 text-base sm:text-lg text-brand-gold font-medium">Your expert witness discovery engine</p>
        <p className="mt-2 text-base sm:text-lg text-brand-slate">Trusted by over 500 law firms nationwide for critical case support.</p>
      </div>

      <div className="relative max-w-3xl mx-auto mt-8 md:mt-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lift p-6 sm:p-8 md:p-12 border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-serif text-brand-navy mb-6 md:mb-8 text-left">Search for Expert Witnesses</h2>
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-8">
            <div>
              <label htmlFor="practice-area" className="block text-sm sm:text-md font-medium text-brand-charcoal mb-2">Practice Area / Field of Expertise</label>
              <input type="text" id="practice-area" name="practice-area" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-brand-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-shadow" placeholder="e.g., Medical Malpractice, Construction Defects" />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm sm:text-md font-medium text-brand-charcoal mb-2">Preferred Location <span className="text-brand-gray-medium">(Optional)</span></label>
              <input type="text" id="location" name="location" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-brand-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-shadow" placeholder="e.g., California, New York, Remote" />
            </div>
            <div>
              <label htmlFor="credentials" className="block text-sm sm:text-md font-medium text-brand-charcoal mb-2">Specific Credentials or Requirements <span className="text-brand-gray-medium">(Optional)</span></label>
              <textarea id="credentials" name="credentials" rows={3} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-brand-gray-light border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-shadow resize-none" placeholder="e.g., Board certified, 10+ years experience"></textarea>
            </div>
            <div className="pt-2 md:pt-4">
              <button type="submit" className="w-full bg-brand-navy text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg hover:shadow-lift hover:bg-brand-charcoal transition-all duration-300 md:transform md:hover:-translate-y-1">
                Search Expert Witnesses
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
