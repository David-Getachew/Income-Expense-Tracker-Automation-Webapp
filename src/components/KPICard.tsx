import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  isPositive?: boolean;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, isPositive, className = '' }) => {
  // Determine card styling based on whether the value is positive
  const getCardClass = () => {
    if (isPositive === undefined) return '';
    return isPositive 
      ? 'border-l-4 border-l-green-500' 
      : 'border-l-4 border-l-red-500';
  };

  // Determine value color
  const getValueColor = () => {
    if (isPositive === undefined) return 'text-gray-900';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className={`${className} ${getCardClass()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getValueColor()}`}>{value}</div>
      </CardContent>
    </Card>
  );
};

export default KPICard;