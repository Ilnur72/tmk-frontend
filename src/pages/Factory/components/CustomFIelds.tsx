import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CustomField, ProjectValue } from '../types/factory';

interface CustomFieldsProps {
  customFields?: CustomField[];
  projectValues?: ProjectValue[];
  totalValue?: string;
  onCustomFieldsChange?: (fields: CustomField[]) => void;
  onProjectValuesChange?: (values: ProjectValue[], total?: string) => void;
  isEdit?: boolean;
}

const CustomFields: React.FC<CustomFieldsProps> = ({
  customFields = [],
  projectValues = [],
  totalValue = '',
  onCustomFieldsChange,
  onProjectValuesChange,
  isEdit = false
}) => {
  const [fields, setFields] = useState<CustomField[]>(customFields);
  const [values, setValues] = useState<ProjectValue[]>(projectValues);
  const [total, setTotal] = useState(totalValue);

  const addCustomField = () => {
    const newFields = [...fields, { key: '', value: '' }];
    setFields(newFields);
    if (onCustomFieldsChange) {
      onCustomFieldsChange(newFields);
    }
  };

  const removeCustomField = (index: number) => {
    if (fields.length > 1) {
      const newFields = fields.filter((_, i) => i !== index);
      setFields(newFields);
      if (onCustomFieldsChange) {
        onCustomFieldsChange(newFields);
      }
    }
  };

  const updateCustomField = (index: number, field: 'key' | 'value', newValue: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [field]: newValue };
    setFields(newFields);
    if (onCustomFieldsChange) {
      onCustomFieldsChange(newFields);
    }
  };

  const addProjectValue = () => {
    const newValues = [...values, { key: '', amount: '' }];
    setValues(newValues);
    if (onProjectValuesChange) {
      onProjectValuesChange(newValues, total);
    }
  };

  const removeProjectValue = (index: number) => {
    if (values.length > 1) {
      const newValues = values.filter((_, i) => i !== index);
      setValues(newValues);
      if (onProjectValuesChange) {
        onProjectValuesChange(newValues, total);
      }
    }
  };

  const updateProjectValue = (index: number, field: 'key' | 'amount', newValue: string) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [field]: newValue };
    setValues(newValues);
    if (onProjectValuesChange) {
      onProjectValuesChange(newValues, total);
    }
  };

  const suffix = isEdit ? 'Edit' : '';

  return (
    <div className="space-y-6">
      {/* Custom Fields Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Қўшимча майдонлар
        </label>
        <div id={`customFieldsContainer${suffix}`} className="space-y-2">
          {fields.map((field, index) => (
            <div key={index} className="custom-field-row flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Майдон номи (масалан: Иш ўрни)"
                className="field-key flex-1 p-2 border rounded text-sm"
                value={field.key}
                onChange={(e) => updateCustomField(index, 'key', e.target.value)}
              />
              <input
                type="text"
                placeholder="Қиймати (масалан: 220та)"
                className="field-value flex-1 p-2 border rounded text-sm"
                value={field.value}
                onChange={(e) => updateCustomField(index, 'value', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeCustomField(index)}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCustomField}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Янги майдон қўшиш
        </button>
      </div>

      {/* Project Values Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Лойиҳанинг қиймати
        </label>
        
        {/* Total Value Input */}
        <div className="mb-4">
          <input
            type="text"
            id={`totalValueInput${suffix}`}
            placeholder="Умумий қиймати (масалан: 150 млн доллар)"
            className="w-full p-2 border rounded"
            value={total}
            onChange={(e) => {
              setTotal(e.target.value);
              if (onProjectValuesChange) {
                onProjectValuesChange(values, e.target.value);
              }
            }}
          />
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Лойиҳа қийматларининг бўлимлари
        </label>
        <div id={`projectValuesContainer${suffix}`} className="space-y-2">
          {values.map((value, index) => (
            <div key={index} className="project-value-row flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Номи (масалан: ФРРУ)"
                className="value-key flex-1 p-2 border rounded text-sm"
                value={value.key}
                onChange={(e) => updateProjectValue(index, 'key', e.target.value)}
              />
              <input
                type="text"
                placeholder="Миқдори (масалан: 16,5 млн долл)"
                className="value-amount flex-1 p-2 border rounded text-sm"
                value={value.amount}
                onChange={(e) => updateProjectValue(index, 'amount', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeProjectValue(index)}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addProjectValue}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Янги бўлим қўшиш
        </button>
      </div>
    </div>
  );
};

export default CustomFields;