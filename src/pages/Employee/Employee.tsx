import React from 'react';

const Employee: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ходимлар</h1>
        <button className="bg-primary hover:opacity-80 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Ходим қўшиш
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Ходимлар бўлими ишлаб чиқилмоқда...</p>
      </div>
    </div>
  );
};

export default Employee;
