import { ChevronUp, User } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  percentage?: number;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  percentage = 22,
  isLoading = false,
}) => {
  return (
    <div className="relative bg-white rounded-lg shadow-lg p-3 md:p-5 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start">
        <User className="h-5 w-5 md:h-7 md:w-7 text-green-500" />
        <div className="flex items-center bg-green-500 text-white text-[10px] md:text-xs font-medium rounded-full py-0.5 px-1.5 md:py-1 md:px-2">
          {percentage}%
          <ChevronUp className="h-3 w-3 md:h-4 md:w-4 ml-0.5" />
        </div>
      </div>
      <div className="mt-3 md:mt-6">
        <div className="text-xl md:text-3xl font-medium text-gray-900">
          {isLoading ? "..." : (value ?? 0).toLocaleString()}
        </div>
        <div className="mt-1 text-xs md:text-base text-gray-500 leading-tight">{description}</div>
      </div>
    </div>
  );
};

export default StatCard;
