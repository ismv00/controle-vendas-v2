import { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  value: string | number;
  valueColor?: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
};

export function StatCard({
  title,
  value,
  valueColor,
  icon: Icon,
  iconBg = 'bg-gray-100',
  iconColor = 'text-gray-600',
}: Props) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className={`mt-3 text-3xl font-semibold ${valueColor ?? 'text-gray-900'}`}>{value}</h2>
      </div>

      {Icon && (
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      )}
    </div>
  );
}
