export default function FeaturedExperts() {
  const experts = [
    {
      name: "Dr. Alana Reyes",
      title: "Forensic Pathologist",
      image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
      details: [
        { icon: "fa-briefcase", text: "25+ Years of Experience" },
        { icon: "fa-gavel", text: "Testified in 150+ Cases" },
        { icon: "fa-star", text: "4.9/5 Attorney Rating" }
      ]
    },
    {
      name: "Marcus Thorne, PE",
      title: "Structural Engineer",
      image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
      details: [
        { icon: "fa-briefcase", text: "30+ Years in Construction" },
        { icon: "fa-gavel", text: "Expert in Construction Defects" },
        { icon: "fa-award", text: "Published in 'Engineering Today'" }
      ]
    },
    {
      name: "Dr. Lena Petrova, CPA",
      title: "Forensic Accountant",
      image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg",
      details: [
        { icon: "fa-briefcase", text: "18 Years of Experience" },
        { icon: "fa-gavel", text: "Specializes in Fraud Detection" },
        { icon: "fa-check-circle", text: "Certified Fraud Examiner (CFE)" }
      ]
    }
  ];

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-brand-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-navy">Meet Our Top-Rated Experts</h2>
          <p className="mt-3 md:mt-4 text-base md:text-lg text-brand-slate max-w-2xl mx-auto px-4">Handpicked professionals with proven track records and extensive courtroom experience.</p>
        </div>
        <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {experts.map((expert, index) => (
            <div key={index} className="bg-white rounded-xl shadow-subtle hover:shadow-lift p-6 md:p-8 border border-gray-200 transition-all duration-300 md:transform md:hover:-translate-y-2">
              <div className="flex items-center space-x-4 md:space-x-6">
                <img className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover flex-shrink-0" src={expert.image} alt={expert.name} />
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl font-serif text-brand-navy truncate">{expert.name}</h3>
                  <p className="text-sm md:text-base text-brand-gold font-semibold">{expert.title}</p>
                </div>
              </div>
              <div className="mt-5 md:mt-6 space-y-2.5 md:space-y-3 text-sm md:text-base text-brand-charcoal">
                {expert.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center">
                    <i className={`fa-solid ${detail.icon} w-5 text-brand-slate mr-3 flex-shrink-0`}></i>
                    <span className="leading-snug">{detail.text}</span>
                  </div>
                ))}
              </div>
              <a href="/signup" className="mt-6 md:mt-8 w-full block text-center border border-brand-navy text-brand-navy text-sm md:text-base font-semibold py-2.5 md:py-3 rounded-lg hover:bg-brand-navy hover:text-white transition-colors duration-300">View Full Profile</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
