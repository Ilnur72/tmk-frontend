import React from 'react';

const Techniques: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Техника</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Техника қўшиш
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Техника бўлими ишлаб чиқилмоқда...</p>
      </div>
    </div>
  );
};

export default Techniques;
