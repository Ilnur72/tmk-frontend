import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

interface SelectOption {
  id: string;
  name: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export function Select({ label, options, value, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={selectRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1 max-md:text-[10px]">
          {label}:
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border-2 border-gray-200 rounded-lg px-2 py-1.5 pr-7 text-left text-gray-700 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent hover:border-cyan-300 transition-all duration-200 flex items-center justify-between shadow-sm"
        >
          <span
            className="truncate"
            title={selectedOption?.name || ""}
            style={{
              display: "inline-block",
              maxWidth: "calc(100% - 24px)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              verticalAlign: "middle",
            }}
          >
            {selectedOption?.name}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-gray-500 transition-transform flex-shrink-0 ml-1 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-cyan-50 transition-colors flex items-center justify-between group ${
                    option.id === value ? "bg-cyan-50" : ""
                  }`}
                >
                  <span
                    className="text-gray-700 truncate"
                    title={option.name}
                    style={{
                      display: "inline-block",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {option.name}
                  </span>
                  {option.id === value && (
                    <Check className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
