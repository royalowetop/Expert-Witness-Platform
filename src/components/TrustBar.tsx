export default function TrustBar() {
  const logos = [
    {
      src: "https://storage.googleapis.com/uxpilot-auth.appspot.com/11df854807-cfa6df48609307166b28.png",
      alt: "logo for a prestigious law firm, grayscale, minimalist style"
    },
    {
      src: "https://storage.googleapis.com/uxpilot-auth.appspot.com/b1b71b0eea-0527c493b52d7d8b1d49.png",
      alt: "logo for a modern tech law firm, grayscale, minimalist style"
    },
    {
      src: "https://storage.googleapis.com/uxpilot-auth.appspot.com/31cbf07453-60dfc1489203e94eda0c.png",
      alt: "logo for a classic corporate law firm, grayscale, minimalist style"
    },
    {
      src: "https://storage.googleapis.com/uxpilot-auth.appspot.com/b2dd188b53-63a032627fc4f8fef2be.png",
      alt: "logo for an intellectual property law firm, grayscale, minimalist style"
    },
    {
      src: "https://storage.googleapis.com/uxpilot-auth.appspot.com/9345e31389-672d93ed402b44b73628.png",
      alt: "logo for a family law practice, grayscale, minimalist style"
    },
    {
      src: "https://storage.googleapis.com/uxpilot-auth.appspot.com/52e6726c89-2d08ca39f59a3161f601.png",
      alt: "logo for an environmental law group, grayscale, minimalist style"
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-xs sm:text-sm md:text-md font-semibold text-brand-slate tracking-wider uppercase">Trusted by Leading Law Firms Nationwide</h3>
        <div className="mt-6 md:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 items-center">
          {logos.map((logo, index) => (
            <div key={index} className="flex justify-center">
              <img className="h-6 sm:h-7 md:h-8 object-contain" src={logo.src} alt={logo.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
