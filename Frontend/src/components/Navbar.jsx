import React, { useState, useEffect } from 'react';
import logo from '../assets/logo_hori.png';
import useDarkMode from '../hooks/useDarkMode';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <nav className="bg-[#2d2d5b] border-b border-gray-700">
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
            className="relative z-50 text-gray-300 dark:text-gray-400"
          >
            {isDarkMode ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293a8 8 0 11-11.586-11.586 8 8 0 0011.586 11.586z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zM4.222 4.222a1 1 0 011.414 0L6.343 5.93a1 1 0 01-1.415 1.415L4.222 5.637a1 1 0 010-1.415zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm8 8a1 1 0 011-1v-1a1 1 0 10-2 0v1a1 1 0 011 1zm5.778-1.778a1 1 0 00-1.414 0L13.657 14.07a1 1 0 001.415 1.415l1.414-1.415a1 1 0 000-1.414zM17 10a1 1 0 00-1-1h-1a1 1 0 100 2h1a1 1 0 001-1z" />
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
