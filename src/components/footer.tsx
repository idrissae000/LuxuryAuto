export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70">
      <div className="section-shell grid gap-8 py-10 sm:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold">Luxury Auto Detailz</h3>
          <p className="mt-2 text-sm text-white/70">Mobile detailing across the Dallas-Fort Worth metroplex.</p>
        </div>
        <div className="text-sm text-white/70 sm:text-right">
          <p>Call: (214) 555-0113</p>
          <p>Email: hello@luxuryautodetailz.com</p>
          <p>Instagram: @luxuryautodetailz</p>
        </div>
      </div>
    </footer>
  );
}
