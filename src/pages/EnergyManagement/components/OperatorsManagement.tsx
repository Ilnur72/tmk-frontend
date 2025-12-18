import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Search, User, Mail, Phone } from "lucide-react";
import { energyService } from "../../../services/energyService";
import { MeterOperator } from "../../../types/energy";
import { toast } from "../../../utils/toast";

interface OperatorsManagementProps {
  factoryId?: number | null;
}

const OperatorsManagement: React.FC<OperatorsManagementProps> = ({
  factoryId,
}) => {
  // const { t } = useTranslation();
  const [operators, setOperators] = useState<MeterOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factoryId]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const data = await energyService.getMeterOperators(factoryId);
      setOperators(data);
    } catch (error: any) {
      console.error("Error fetching operators:", error);
      toast.error("Failed to load operators");
    } finally {
      setLoading(false);
    }
  };

  const filteredOperators = operators.filter(
    (operator) =>
      operator.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Operators Management
          </h2>
          <p className="text-gray-600 mt-2">
            Manage meter operators and their assignments
          </p>
        </div>
        <button
          onClick={() => {}}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Operator
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search operators by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Operators List */}
      {filteredOperators.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No operators found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "No operators match your search criteria."
              : "Get started by creating a new operator."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredOperators.map((operator) => (
              <li key={operator.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {operator.first_name || "N/A"}{" "}
                          {operator.last_name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {operator.email || "No email"}
                        </div>
                        {operator.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-1" />
                            {operator.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          operator.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {operator.is_active ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => {}}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {}}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="text-sm text-gray-500">
                      Operator ID: #{operator.id}
                    </div>
                    <div className="text-sm text-gray-500 sm:mt-0">
                      Created:{" "}
                      {operator.created_at
                        ? new Date(operator.created_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OperatorsManagement;
