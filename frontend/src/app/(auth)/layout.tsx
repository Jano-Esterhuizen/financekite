export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 xl:px-24 bg-background">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          {children}
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center lg:text-left">
          © 2025 FinanceKite. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 xl:p-16 relative overflow-hidden rounded-3xl m-4"
        style={{ background: 'linear-gradient(135deg, hsl(190,52%,36%) 0%, hsl(190,60%,30%) 50%, hsl(195,65%,24%) 100%)' }}>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1">
          <div className="mb-12">
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              The simplest way to manage your business finances
            </h2>
            <p className="text-white/70 text-lg">
              Track invoices, manage expenses and get paid on time.
            </p>
          </div>

          {/* Dashboard Mockup imported as component */}
          <DashboardMockupInline />
        </div>

        {/* Brand trust row */}
        <div className="relative z-10 mt-12">
          <div className="flex items-center justify-between gap-6 opacity-50">
            {['Secure', 'POPIA Compliant', '99.9% Uptime', 'Encrypted', 'Always On'].map((badge) => (
              <span key={badge} className="text-white text-sm font-medium tracking-wide">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardMockupInline() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs">Total Revenue</p>
            <p className="text-white text-2xl font-bold">R 48,592</p>
          </div>
          <div className="flex items-center self-end gap-1 text-emerald-300 text-xs font-medium pb-1">
          ↑ +15%
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-white/30" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
            <span className="text-emerald-300 text-xs">📄</span>
          </div>
          <div>
            <p className="text-white/60 text-[10px]">Paid Invoices</p>
            <p className="text-white text-sm font-semibold">24 this month</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-400/20 flex items-center justify-center">
            <span className="text-violet-300 text-xs">💰</span>
          </div>
          <div>
            <p className="text-white/60 text-[10px]">Future Profit</p>
            <p className="text-white text-sm font-semibold">R 49,300</p>
          </div>
        </div>
      </div>
    </div>
  )
}