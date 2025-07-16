import React, { useState, useEffect } from 'react';
import logo from '../assets/logo_hori.png';
import useDarkMode from '../hooks/useDarkMode';
import '../App.css'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <nav className="bg-[#2d2d5b] border-b border-gray-700 ">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* LOGO */}
        <a href="#" className="flex items-center space-x-3">
          <img src={logo} className="h-8" alt="Code Arena" />
        </a>

        {/* Right side */}
        <div className="flex items-center md:order-2 space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            type="button"
            aria-label="Toggle Dark Mode"
            className="relative z-50 p-2 rounded-full bg-yellow-400 text-yellow-900 dark:bg-gray-700 dark:text-yellow-300 transition-colors duration-300"
          >
            {isDarkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m8.485-8.485h-1M4.515 12.515h-1m15.364 4.95l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707M6.343 17.657l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} fill="none" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path d="M17.293 13.293a8 8 0 11-11.586-11.586 8 8 0 0011.586 11.586z" />
              </svg>
            )}
          </button>

          {/* User Icon */}
          <button
            type="button"
            className="flex text-sm bg-gray-700 rounded-full focus:ring-4 focus:ring-gray-300"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <img className="w-8 h-8 rounded-full" src="car22.jpg" alt="User" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-600 absolute right-4 top-16">
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dark:text-white">Bonnie Green</span>
                <span className="block text-sm text-gray-500 truncate dark:text-gray-400">name@flowbite.com</span>
              </div>
              <ul className="py-2">
                <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-white">Dashboard</a></li>
                <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-white">Settings</a></li>
                <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-white">Earnings</a></li>
                <li><a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:hover:text-white">Sign out</a></li>
              </ul>
            </div>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-white rounded-lg md:hidden hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 17 14">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center md:w-auto md:order-1">
          <ul className="flex flex-col md:flex-row md:space-x-8 font-medium mt-4 md:mt-0">
            <li><a href="#" className="block py-2 px-3 text-white hover:text-purple-300">Home</a></li>
            <li><a href="#" className="block py-2 px-3 text-white hover:text-purple-300">About</a></li>
            <li><a href="#" className="block py-2 px-3 text-white hover:text-purple-300">Practice</a></li>
            <li><a href="#" className="block py-2 px-3 text-white hover:text-purple-300">Contests</a></li>
            <li><a href="#" className="block py-2 px-3 text-white hover:text-purple-300">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="md:hidden w-full bg-[#9574bd]">
          <ul className="flex flex-col font-medium p-4">
            <li><a href="#" className="block py-2 px-3 text-white hover:bg-[#6A4C93] rounded">Home</a></li>
            <li><a href="#" className="block py-2 px-3 text-white hover:bg-[#6A4C93] rounded">About</a></li>
            <li><a href="#" className="block py-2 px-3 text-white hover:bg-[#6A4C93] rounded">Practice</a></li>
            <li><a href="#" className="block py-2 px-3 text-white hover:bg-[#6A4C93] rounded">Contests</a></li>
            <li><a href="#" className="block py-2 px-3 text-white hover:bg-[#6A4C93] rounded">Contact</a></li>
          </ul>
        </div>
      )}
    </nav>
  );
}
