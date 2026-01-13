import React, { useState } from "react";
import { Meter } from "../../../types/energy";

import { MeterReading } from "../../../types/energy";
interface MeterCalendarInputProps {
  meter: Meter;
  readings: MeterReading[];
  onSubmit: (date: string, value: number) => void;
}

const MeterCalendarInput: React.FC<MeterCalendarInputProps> = ({
  meter,
  readings,
  onSubmit,
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setInputValue("");
  };

  const handleSubmit = () => {
    if (selectedDay && inputValue) {
      // Use UTC date to avoid timezone shift
      const date = new Date(Date.UTC(year, month, selectedDay)).toISOString();
      onSubmit(date, parseFloat(inputValue));
      setSelectedDay(null);
      setInputValue("");
    }
  };

  // Helper: get reading for a specific day
  const getReadingForDay = (day: number) => {
    // Use UTC date for comparison
    const date = new Date(Date.UTC(year, month, day));
    return readings.find((r) => {
      const readingDate = new Date(r.reading_date);
      return (
        readingDate.getUTCFullYear() === date.getUTCFullYear() &&
        readingDate.getUTCMonth() === date.getUTCMonth() &&
        readingDate.getUTCDate() === date.getUTCDate()
      );
    });
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {[...Array(daysInMonth)].map((_, i) => {
          const reading = getReadingForDay(i + 1);
          return (
            <button
              key={i + 1}
              className={`border rounded-lg h-14 flex flex-col items-center justify-center text-base font-medium transition-colors duration-150 ${
                selectedDay === i + 1
                  ? "bg-blue-100 border-blue-500"
                  : "bg-white hover:bg-blue-50"
              }`}
              onClick={() => handleDayClick(i + 1)}
            >
              <span>{i + 1}</span>
              {reading && (
                <span className="text-xs text-blue-700 font-semibold mt-1">
                  {reading.current_reading}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedDay && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="mb-2 font-semibold">
            {selectedDay}-kun uchun qiymat kiriting:
          </div>
          <input
            type="number"
            className="border px-3 py-2 rounded w-full mb-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Qiymat..."
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Saqlash
          </button>
        </div>
      )}
    </div>
  );
};

export default MeterCalendarInput;
