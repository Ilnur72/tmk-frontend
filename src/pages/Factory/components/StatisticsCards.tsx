import React from "react";
import {
  ShoppingCart,
  Monitor,
  CreditCard,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { FactoryCounts } from "../../../types";

interface StatisticsCardsProps {
  total: number;
  counts: FactoryCounts;
  onFilterChange: (status?: string) => void;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  total,
  counts,
  onFilterChange,
}) => {
  const ConstructionIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-construction-icon lucide-construction text-success"
    >
      <rect x="2" y="6" width="20" height="8" rx="1"></rect>
      <path d="M17 14v7"></path>
      <path d="M7 14v7"></path>
      <path d="M17 3v3"></path>
      <path d="M7 3v3"></path>
      <path d="M10 14 2.3 6.3"></path>
      <path d="m14 6 7.7 7.7"></path>
      <path d="m8 6 8 8"></path>
    </svg>
  );

  return (
    <div className="mt-5 grid grid-cols-12 gap-6">
      {/* Total Projects */}
      <div
        onClick={() => onFilterChange("")}
        className="intro-y col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer"
      >
        <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
          <div className="box p-5">
            <div className="flex">
              <ShoppingCart
                className="stroke-1.5 h-[28px] w-[28px] text-primary"
                style={{ color: "#00a0c6" }}
              />
              <div className="ml-auto">
                <div className="tooltip cursor-pointer flex items-center rounded-full bg-success py-[3px] pl-2 pr-1 text-xs font-medium text-white">
                  33%
                  <ChevronUp className="stroke-1.5 ml-0.5 h-4 w-4" />
                </div>
              </div>
            </div>
            <div
              id="total-count"
              className="mt-6 text-3xl font-medium leading-8"
            >
              {total}
            </div>
            <div className="mt-1 text-base text-slate-500">Жами лойиҳалар</div>
          </div>
        </div>
      </div>

      {/* Registration */}
      <div
        onClick={() => onFilterChange("REGISTRATION")}
        className="intro-y col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer"
      >
        <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
          <div className="box p-5">
            <div className="flex">
              <Monitor className="stroke-1.5 h-[28px] w-[28px] text-warning" />
              <div className="ml-auto">
                <div className="tooltip cursor-pointer flex items-center rounded-full bg-success py-[3px] pl-2 pr-1 text-xs font-medium text-white">
                  22%
                  <ChevronUp className="stroke-1.5 ml-0.5 h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="mt-6 text-3xl font-medium leading-8">
              {counts.registrationCount}
            </div>
            <div className="mt-1 text-base text-slate-500">
              Расмийлаштириш жараёнида
            </div>
          </div>
        </div>
      </div>

      {/* Construction */}
      <div
        onClick={() => onFilterChange("CONSTRUCTION")}
        className="intro-y col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer"
      >
        <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
          <div className="box p-5">
            <div className="flex">
              <ConstructionIcon />
              <div className="ml-auto">
                <div className="tooltip cursor-pointer flex items-center rounded-full bg-success py-[3px] pl-2 pr-1 text-xs font-medium text-white">
                  12%
                  <ChevronUp className="stroke-1.5 ml-0.5 h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="mt-6 text-3xl font-medium leading-8">
              {counts.constructionCount}
            </div>
            <div className="mt-1 text-base text-slate-500">
              Қурилиш жараёнида
            </div>
          </div>
        </div>
      </div>

      {/* Started */}
      <div
        onClick={() => onFilterChange("STARTED")}
        className="intro-y col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer"
      >
        <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
          <div className="box p-5">
            <div className="flex">
              <CreditCard className="stroke-1.5 h-[28px] w-[28px] text-pending" />
              <div className="ml-auto">
                <div className="tooltip cursor-pointer flex items-center rounded-full bg-danger py-[3px] pl-2 pr-1 text-xs font-medium text-white">
                  2%
                  <ChevronDown className="stroke-1.5 ml-0.5 h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="mt-6 text-3xl font-medium leading-8">
              {counts.startedCount}
            </div>
            <div className="mt-1 text-base text-slate-500">Ишга тушганлари</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
