"use client";

import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
  label?: string;
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  label,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="flex items-center gap-1.5 sm:gap-2 glass rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-4 sm:py-2 border border-white/20 relative"
    >
      {label && (
        <label
          htmlFor={id}
          className="text-white/70 text-xs sm:text-sm font-light whitespace-nowrap hidden sm:inline"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/10 text-white rounded-md sm:rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-light border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:bg-white/20 flex items-center gap-1.5 sm:gap-2 min-w-[90px] sm:min-w-[120px] justify-between"
        >
          <span>{selectedOption?.label || "Select..."}</span>
          <svg
            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 sm:mt-2 bg-[#1a1625] border border-white/30 rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50 backdrop-blur-xl">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-light transition-all cursor-pointer ${
                  option.value === value
                    ? "bg-blue-500/30 text-blue-200 font-medium"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
