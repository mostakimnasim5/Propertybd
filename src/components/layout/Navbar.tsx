'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Menu, X, Home, Car, Wrench, Plus, User, LogOut, Shield } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Property<span className="text-green-600">BD</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/properties" className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 text-sm font-medium transition-colors">
              <Home className="w-4 h-4" /> প্রপার্টি
            </Link>
            <Link href="/vehicles" className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 text-sm font-medium transition-colors">
              <Car className="w-4 h-4" /> গাড়ি
            </Link>
            <Link href="/construction" className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 text-sm font-medium transition-colors">
              <Wrench className="w-4 h-4" /> নির্মাণ
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/post-listing"
              className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> বিজ্ঞাপন দিন
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">{user.name || user.phone}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                      <User className="w-4 h-4" /> আমার ড্যাশবোর্ড
                    </Link>
                    <Link href="/saved" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                      <Home className="w-4 h-4" /> সেভ করা
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50" onClick={() => setDropdownOpen(false)}>
                        <Shield className="w-4 h-4" /> অ্যাডমিন
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> লগআউট
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-sm text-gray-700 hover:text-green-600 font-medium">
                লগইন
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <Link href="/properties" className="flex items-center gap-2 text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
              <Home className="w-4 h-4" /> প্রপার্টি
            </Link>
            <Link href="/vehicles" className="flex items-center gap-2 text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
              <Car className="w-4 h-4" /> গাড়ি
            </Link>
            <Link href="/construction" className="flex items-center gap-2 text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
              <Wrench className="w-4 h-4" /> নির্মাণ
            </Link>
            <hr />
            <Link href="/post-listing" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg" onClick={() => setMenuOpen(false)}>
              <Plus className="w-4 h-4" /> বিজ্ঞাপন দিন
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                  <User className="w-4 h-4" /> ড্যাশবোর্ড
                </Link>
                <button onClick={logout} className="flex items-center gap-2 text-red-600 py-2">
                  <LogOut className="w-4 h-4" /> লগআউট
                </button>
              </>
            ) : (
              <Link href="/login" className="text-gray-700 py-2 block" onClick={() => setMenuOpen(false)}>
                লগইন
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
