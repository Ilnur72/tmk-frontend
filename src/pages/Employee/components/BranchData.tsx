import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Download, Users } from 'lucide-react';
import axios from 'axios';

// Types
interface BranchData {
  id: number;
  filial_nomi: string;
  hodimlar_soni: number;
}


const apiService = {
  async getAllBranches(): Promise<BranchData[]> {
    const response = await axios.get(`/employers/tashkilot-statistika/`);
    return response.data.map((item: any, index: number) => ({
      id: index,
      filial_nomi: item.tashkilot,
      hodimlar_soni: item.count
    }));
  }
};

// Header Component
const BranchesHeader: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="w-full px-2 sm:px-2 lg:px-2">
        <div className="flex items-center justify-between py-3 flex-wrap gap-3">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Орқага қайтиш
            </button>
          </div>
          
          {/* <div className="flex items-center space-x-4">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Филтр
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

// Search Component
const SearchBar: React.FC<{ searchTerm: string; onSearch: (term: string) => void }> = ({ 
  searchTerm, 
  onSearch 
}) => {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Филиал номи бўйича қидириш..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

// Statistics Summary Component
const StatsSummary: React.FC<{ branches: BranchData[]; filteredCount: number }> = ({ 
  branches, 
  filteredCount 
}) => {
  const totalEmployees = branches.reduce((sum, branch) => sum + branch.hodimlar_soni, 0);
  const averageEmployees = branches.length > 0 ? Math.round(totalEmployees / branches.length) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Жами филиаллар</p>
            <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-green-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Жами ходимлар</p>
            <p className="text-2xl font-bold text-gray-900">{totalEmployees.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-purple-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Ўртача ходимлар</p>
            <p className="text-2xl font-bold text-gray-900">{averageEmployees}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-orange-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Топилган натижалар</p>
            <p className="text-2xl font-bold text-gray-900">{filteredCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Table Component
const BranchesTable: React.FC<{ 
  branches: BranchData[]; 
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}> = ({ branches, loading, currentPage, itemsPerPage, onPageChange }) => {
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBranches = branches.slice(startIndex, endIndex);
  const totalPages = Math.ceil(branches.length / itemsPerPage);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-t-lg"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-b border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Филиал номи
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ходимлар сони
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Фоиз
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBranches.length > 0 ? (
              currentBranches.map((branch, index) => {
                const actualIndex = startIndex + index;
                const totalEmployees = branches.reduce((sum, b) => sum + b.hodimlar_soni, 0);
                const percentage = totalEmployees > 0 ? ((branch.hodimlar_soni / totalEmployees) * 100).toFixed(1) : '0.0';
                
                return (
                  <tr 
                    key={branch.id} 
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {actualIndex}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {branch.filial_nomi}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {branch.hodimlar_soni.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Ҳеч қандай филиал топилмади</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Олдинги
              </button>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Кейинги
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Кўрсатилмоқда{' '}
                  <span className="font-medium">{startIndex + 1}</span>
                  {' '}дан{' '}
                  <span className="font-medium">{Math.min(endIndex, branches.length)}</span>
                  {' '}гача, жами{' '}
                  <span className="font-medium">{branches.length}</span>
                  {' '}та натижа
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Олдинги
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Кейинги
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Branches Page Component
const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getAllBranches();
        setBranches(data);
        setFilteredBranches(data);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Маълумотларни юклашда хatolik юз берди');
        
        // Fallback data
        const fallbackData: BranchData[] = [];
        setBranches(fallbackData);
        setFilteredBranches(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const filtered = branches.filter(branch =>
      branch.filial_nomi.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBranches(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, branches]);

  const handleBack = () => {
    // This would typically navigate back using React Router
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-100  max-sm:pt-12">
      <BranchesHeader onBack={handleBack} />

      <div className="w-full px-2 sm:px-2 lg:px-2 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Барча филиаллар ҳақида маълумот
          </h1>
          <p className="text-gray-600">
            Комбинат филиалларидаги ходимлар сони ва статистика маълумотлари
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <StatsSummary branches={branches} filteredCount={filteredBranches.length} />

        <div className="mb-6">
          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
        </div>

        <BranchesTable
          branches={filteredBranches}
          loading={loading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default BranchesPage;