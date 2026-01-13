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
    <div className="relative bg-white rounded-lg shadow-lg p-5 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start">
        <User className="h-7 w-7 text-green-500" />
        <div className="flex items-center bg-green-500 text-white text-xs font-medium rounded-full py-1 px-2">
          {percentage}%
          <ChevronUp className="h-4 w-4 ml-0.5" />
        </div>
      </div>
      <div className="mt-6">
        <div className="text-3xl font-medium text-gray-900">
          {isLoading ? "..." : (value ?? 0).toLocaleString()}
        </div>
        <div className="mt-1 text-base text-gray-500">{description}</div>
      </div>
    </div>
  );
};

export default StatCard;
