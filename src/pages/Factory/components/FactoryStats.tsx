import React from 'react';
import { 
  ShoppingCartIcon, 
  ComputerDesktopIcon, 
  WrenchScrewdriverIcon, 
  CreditCardIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface StatsData {
  total: number;
  registrationCount: number;
  constructionCount: number;
  startedCount: number;
}

interface FactoryStatsProps {
  stats: StatsData;
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

const FactoryStats: React.FC<FactoryStatsProps> = ({ stats, onFilterChange, currentFilter }) => {
  const statsCards = [
    {
      title: 'Жами лойиҳалар',
      count: stats.total,
      icon: ShoppingCartIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      percentage: 33,
      trend: 'up',
      filter: 'all'
    },
    {
      title: 'Расмийлаштириш жараёнида',
      count: stats.registrationCount,
      icon: ComputerDesktopIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      percentage: 22,
      trend: 'up',
      filter: 'REGISTRATION'
    },
    {
      title: 'Қурилиш жараёнида',
      count: stats.constructionCount,
      icon: WrenchScrewdriverIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      percentage: 12,
      trend: 'up',
      filter: 'CONSTRUCTION'
    },
    {
      title: 'Ишга тушганлари',
      count: stats.startedCount,
      icon: CreditCardIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      percentage: 2,
      trend: 'down',
      filter: 'STARTED'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? ChevronUpIcon : ChevronDownIcon;
        const isActive = currentFilter === card.filter;
        
        return (
          <div
            key={index}
            onClick={() => onFilterChange(card.filter)}
            className={`
              relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md
              ${isActive ? 'ring-2 ring-blue-500 border-blue-500' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-7 w-7 ${card.color}`} />
              </div>
              <div className={`
                flex items-center rounded-full px-2 py-1 text-xs font-medium text-white
                ${card.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}
              `}>
                {card.percentage}%
                <TrendIcon className="ml-1 h-3 w-3" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                {card.count}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {card.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FactoryStats;
