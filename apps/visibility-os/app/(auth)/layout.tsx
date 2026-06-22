export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-8 h-8 flex items-center justify-center" style={{ border: "1px solid rgba(201,169,110,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke="#C9A96E" strokeWidth="2" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-display text-lg font-light" style={{ color: "#FAF7F2" }}>
            Visibility <span className="gold-text">OS</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
