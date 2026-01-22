export default function PricingFAQ() {
  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, ACH transfers, and can accommodate wire transfers for Enterprise clients."
    },
    {
      question: "Is there a contract commitment?",
      answer: "No long-term contracts required. All plans are month-to-month, though annual billing offers significant savings."
    }
  ];

  return (
    <section className="py-16 bg-brand-gray-light">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-bold text-brand-navy text-center mb-12">Frequently Asked Questions</h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-subtle">
              <h3 className="text-lg font-semibold text-brand-navy mb-2">{faq.question}</h3>
              <p className="text-brand-slate">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
