import { Calendar } from "lucide-react";

const GrowthsChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          Ходимлар сонини ўсиши
        </h2>
        <div className="relative mt-3 sm:mt-0">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="pl-10 pr-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-56"
            placeholder="Сана танланг"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center mb-6">
        <div className="flex">
          <div>
            <div className="text-lg font-medium text-blue-600 xl:text-xl">
              Қабул қилинган 56
              <br />
              Бўшаган 12
            </div>
            <div className="mt-0.5 text-gray-500">Жорий ой</div>
          </div>
          <div className="mx-4 h-12 w-px border border-dashed border-gray-200 xl:mx-5"></div>
          <div>
            <div className="text-lg font-medium text-gray-500 xl:text-xl">
              Қабул қилинган 30
              <br />
              Бўшаган 3
            </div>
            <div className="mt-0.5 text-gray-500">Аввалги ой</div>
          </div>
        </div>
      </div>

      <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">График бу ерда кўрсатилади</p>
      </div>
    </div>
  );
};
export default GrowthsChart;
