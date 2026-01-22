interface PricingPlansProps {
  isAnnual: boolean;
}

export default function PricingPlans({ isAnnual }: PricingPlansProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

          <div className="bg-white border border-gray-200 rounded-xl p-8 relative">
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold text-brand-navy">Trial</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-brand-navy">$0</span>
                <span className="text-brand-slate">/month</span>
              </div>
              <p className="mt-2 text-sm text-brand-slate">Perfect for trying the platform</p>
            </div>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">3 searches per month</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Basic search filters</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">View expert profiles</span></li>
              <li className="flex items-start"><i className="fa-solid fa-times text-brand-gray-medium mt-1 mr-3"></i><span className="text-sm text-brand-gray-medium">No contact information</span></li>
              <li className="flex items-start"><i className="fa-solid fa-times text-brand-gray-medium mt-1 mr-3"></i><span className="text-sm text-brand-gray-medium">No messaging</span></li>
            </ul>

            <button className="w-full mt-8 border border-brand-navy text-brand-navy font-semibold py-3 rounded-lg hover:bg-brand-navy hover:text-white transition-all duration-300">Get Started Free</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-8 relative">
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold text-brand-navy">Solo Practitioner</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-brand-navy">${isAnnual ? '25' : '30'}</span>
                <span className="text-brand-slate">/month</span>
              </div>
              {isAnnual && <p className="mt-2 text-sm text-brand-slate">$300/year (save $60)</p>}
              {!isAnnual && <p className="mt-2 text-sm text-brand-slate">For individual lawyers</p>}
            </div>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Unlimited searches</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Full expert profiles</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Contact information access</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Direct messaging</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Save favorite experts</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Search history</span></li>
            </ul>

            <button className="w-full mt-8 bg-brand-navy text-white font-semibold py-3 rounded-lg hover:bg-brand-charcoal transition-all duration-300">Choose Solo Plan</button>
          </div>

          <div className="bg-white border-2 border-brand-gold rounded-xl p-8 relative shadow-lift">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-brand-gold text-white px-6 py-2 rounded-full text-sm font-semibold">Most Popular</span>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold text-brand-navy">Professional</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-brand-navy">${isAnnual ? '67' : '80'}</span>
                <span className="text-brand-slate">/month</span>
              </div>
              {isAnnual && <p className="mt-2 text-sm text-brand-slate">$800/year (save $160)</p>}
              {!isAnnual && <p className="mt-2 text-sm text-brand-slate">For small firms</p>}
            </div>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Everything in Solo, PLUS:</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Up to 3 user seats</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Shared expert database</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Advanced filters</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Priority support</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-brand-gold mt-1 mr-3"></i><span className="text-sm">Download expert CVs</span></li>
            </ul>

            <button className="w-full mt-8 bg-brand-gold text-white font-semibold py-3 rounded-lg hover:bg-brand-gold-light transition-all duration-300">Choose Professional</button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-xs text-brand-gold font-medium">Most firms choose this plan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
