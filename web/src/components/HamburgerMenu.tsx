"use client";
import { useState } from "react";
import { ThemeToggle } from "@/ThemeToggle";
const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="relative ml-4">
      {/* Hamburger Button */}{" "}
      <button
        onClick={toggleMenu}
        className="w-12 h-12 rounded-full bg-gray-800 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        aria-label="Open menu"
      >
        {" "}
        <div className="w-6 h-6 flex flex-col justify-around">
          {" "}
          <span
            className={`block w-full h-0.5 bg-gray-200 dark:bg-gray-200 transform transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-2.5" : ""
            }`}
          ></span>{" "}
          <span
            className={`block w-full h-0.5 bg-gray-200 dark:bg-gray-200 transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          ></span>{" "}
          <span
            className={`block w-full h-0.5 bg-gray-200 dark:bg-gray-200 transform transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2.5" : ""
            }`}
          ></span>{" "}
        </div>{" "}
      </button>
      {/* Dropdown Panel */}{" "}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 shadow-lg rounded-lg z-50 p-6 transition-all duration-300">
          {" "}
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Settings{" "}
          </h2>
          {/* Theme Switcher */}{" "}
          <div className="flex items-center justify-between">
            {" "}
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <ThemeToggle />{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
export default HamburgerMenu;
