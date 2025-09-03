interface AdditionalStatsCardProps {
  title: string;
  value: string;
  description?: string;
  percentage?: string;
  hasChart?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

const AdditionalStatsCard: React.FC<AdditionalStatsCardProps> = ({
  title,
  value,
  description,
  percentage,
  hasChart = false,
  onClick,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-5 ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className={hasChart ? "w-1/2" : "flex-1"}>
          <div
            className="text-lg font-medium text-gray-900"
            dangerouslySetInnerHTML={{ __html: title }}
          ></div>
          {description && (
            <div className="mt-1 text-gray-500">{description}</div>
          )}
        </div>

        {hasChart ? (
          <div className="relative flex-none">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              {percentage && (
                <div className="font-medium text-gray-700">{percentage}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="ml-auto">
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {value}
            </span>
          </div>
        )}
      </div>

      {!hasChart && (
        <div className="mt-4 h-14 bg-gray-50 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs">График</span>
        </div>
      )}
    </div>
  );
};

export default AdditionalStatsCard;
