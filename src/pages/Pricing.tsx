import { useState } from 'react';
import PricingHero from '../components/PricingHero';
import PricingPlans from '../components/PricingPlans';
import PricingFAQ from '../components/PricingFAQ';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <>
      <PricingHero isAnnual={isAnnual} onToggle={setIsAnnual} />
      <PricingPlans isAnnual={isAnnual} />
      <PricingFAQ />
    </>
  );
}
