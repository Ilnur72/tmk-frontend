interface PieChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

const PieChart: React.FC<PieChartProps> = ({ title, data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-5">{title}</h2>

      <div className="h-52 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
        <p className="text-gray-500">Диаграмма бу ерда кўрсатилади</p>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-2 h-2 rounded-full mr-3"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="flex-1 truncate text-gray-700">{item.label}</span>
            <span className="font-medium text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PieChart;