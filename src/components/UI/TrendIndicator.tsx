import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  value: number;
  trend: "up" | "down" | "stable";
  showIcon?: boolean;
  className?: string;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  trend,
  showIcon = true,
  className = "",
}) => {
  const getColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-50";
      case "down":
        return "text-red-600 bg-red-50";
      case "stable":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      case "stable":
        return <Minus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${getColor()} ${className}`}
    >
      {showIcon && getIcon()}
      <span>
        {trend === "up" && "+"}
        {Math.abs(value).toFixed(1)}%
      </span>
    </span>
  );
};

export default TrendIndicator;
