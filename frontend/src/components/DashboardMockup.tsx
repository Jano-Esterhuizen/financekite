import { TrendingUp, FileText, DollarSign } from "lucide-react"

const DashboardMockup = () => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main stats card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs">Total Revenue</p>
            <p className="text-white text-2xl font-bold">R 48,592</p>
          </div>
          <div className="flex items-center gap-1 text-emerald-300 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            +12.5%
          </div>
        </div>
        {/* Mini bar chart */}
        <div className="flex items-end gap-1.5 h-16">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-white/30"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Floating card - top right */}
      <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <p className="text-white/60 text-[10px]">Paid Invoices</p>
            <p className="text-white text-sm font-semibold">24 this month</p>
          </div>
        </div>
      </div>

      {/* Floating card - bottom left */}
      <div className="absolute -bottom-6 -left-4 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-400/20 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-violet-300" />
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

export default DashboardMockup