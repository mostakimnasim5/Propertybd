import Link from 'next/link'
import { Home, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PropertyBD</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            বাংলাদেশের সবচেয়ে বিশ্বস্ত প্রপার্টি মার্কেটপ্লেস। ফ্ল্যাট, বাড়ি, জমি, গাড়ি সব এক জায়গায়।
          </p>
        </div>

        {/* Properties */}
        <div>
          <h3 className="text-white font-semibold mb-4">প্রপার্টি</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/properties?purpose=RENT&type=FLAT" className="hover:text-green-400 transition-colors">ফ্ল্যাট ভাড়া</Link></li>
            <li><Link href="/properties?purpose=SALE&type=FLAT" className="hover:text-green-400 transition-colors">ফ্ল্যাট বিক্রি</Link></li>
            <li><Link href="/properties?type=LAND" className="hover:text-green-400 transition-colors">জমি বিক্রি</Link></li>
            <li><Link href="/properties?type=SHOP" className="hover:text-green-400 transition-colors">দোকান/অফিস</Link></li>
            <li><Link href="/properties?type=HOUSE" className="hover:text-green-400 transition-colors">বাড়ি বিক্রি</Link></li>
          </ul>
        </div>

        {/* Vehicles */}
        <div>
          <h3 className="text-white font-semibold mb-4">গাড়ি</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/vehicles?type=CAR&purpose=SALE" className="hover:text-green-400 transition-colors">কার বিক্রি</Link></li>
            <li><Link href="/vehicles?type=CAR&purpose=RENT" className="hover:text-green-400 transition-colors">কার ভাড়া</Link></li>
            <li><Link href="/vehicles?type=BIKE&purpose=SALE" className="hover:text-green-400 transition-colors">বাইক বিক্রি</Link></li>
            <li><Link href="/construction" className="hover:text-green-400 transition-colors">নির্মাণ সেবা</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">যোগাযোগ</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-400" />
              <span>+880 1XXX-XXXXXX</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-400" />
              <span>info@propertybd.com</span>
            </li>
          </ul>
          <div className="mt-4">
            <Link href="/post-listing" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors inline-block">
              বিজ্ঞাপন দিন
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PropertyBD. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/privacy" className="hover:text-gray-300">গোপনীয়তা নীতি</Link>
            <Link href="/terms" className="hover:text-gray-300">শর্তাবলী</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
