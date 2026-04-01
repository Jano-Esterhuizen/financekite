import { Info } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  subtitleColor?: 'muted' | 'success' | 'destructive'
  sparklineData?: number[]
}

const MetricCard = ({ title, value, subtitle, subtitleColor = 'muted', sparklineData }: MetricCardProps) => {
  const subtitleCls =
    subtitleColor === 'success'
      ? 'text-success'
      : subtitleColor === 'destructive'
      ? 'text-destructive'
      : 'text-muted-foreground'

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <Info size={16} className="text-muted-foreground" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className={`text-xs mt-1 ${subtitleCls}`}>{subtitle}</p>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="flex items-end gap-[3px] h-10">
            {sparklineData.map((v, i) => (
              <div
                key={i}
                className="w-[5px] rounded-sm bg-primary/70"
                style={{ height: `${(v / Math.max(...sparklineData)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricCard
