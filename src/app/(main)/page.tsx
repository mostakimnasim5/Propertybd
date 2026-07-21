import Link from 'next/link'
import { Home, Car, Wrench, Search, Shield, Users, TrendingUp } from 'lucide-react'

const CATEGORIES = [
  { icon: '🏠', label: 'ফ্ল্যাট ভাড়া', href: '/properties?purpose=RENT&type=FLAT' },
  { icon: '🏡', label: 'বাড়ি বিক্রি', href: '/properties?purpose=SALE&type=HOUSE' },
  { icon: '🏞️', label: 'জমি বিক্রি', href: '/properties?type=LAND' },
  { icon: '🏪', label: 'দোকান/অফিস', href: '/properties?type=SHOP' },
  { icon: '🚗', label: 'কার বিক্রি', href: '/vehicles?type=CAR&purpose=SALE' },
  { icon: '🚕', label: 'কার ভাড়া', href: '/vehicles?type=CAR&purpose=RENT' },
  { icon: '🏍️', label: 'বাইক বিক্রি', href: '/vehicles?type=BIKE&purpose=SALE' },
  { icon: '🏗️', label: 'নির্মাণ সেবা', href: '/construction' },
]

const STATS = [
  { label: 'সক্রিয় বিজ্ঞাপন', value: '৫,০০০+', icon: TrendingUp },
  { label: 'নিবন্ধিত ব্যবহারকারী', value: '২০,০০০+', icon: Users },
  { label: 'যাচাইকৃত বিক্রেতা', value: '১,৫০০+', icon: Shield },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            বাংলাদেশের সেরা<br />
            <span className="text-yellow-300">প্রপার্টি মার্কেটপ্লেস</span>
          </h1>
          <p className="text-green-100 text-lg mb-8">
            ফ্ল্যাট, বাড়ি, জমি, গাড়ি কিনুন বা ভাড়া নিন — সহজে, নিরাপদে
          </p>

          {/* Quick Search */}
          <div className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto shadow-xl">
            <input
              type="text"
              placeholder="এলাকা, জেলা বা প্রপার্টির ধরন লিখুন..."
              className="flex-1 px-4 py-3 text-gray-800 rounded-xl outline-none text-sm"
            />
            <Link
              href="/properties"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Search className="w-4 h-4" /> খুঁজুন
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">ক্যাটাগরি</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center group-hover:text-green-600">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-50 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {STATS.map(stat => (
            <div key={stat.label}>
              <stat.icon className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sections Links */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        <Link href="/properties" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition-all">
          <Home className="w-10 h-10 text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600">প্রপার্টি</h3>
          <p className="text-gray-500 text-sm">ফ্ল্যাট, বাড়ি, জমি, দোকান কেনাবেচা ও ভাড়া। সারা বাংলাদেশে হাজারো বিজ্ঞাপন।</p>
          <span className="mt-4 inline-block text-green-600 text-sm font-medium">সব দেখুন →</span>
        </Link>

        <Link href="/vehicles" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition-all">
          <Car className="w-10 h-10 text-blue-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">গাড়ি</h3>
          <p className="text-gray-500 text-sm">প্রাইভেট কার ও বাইক — বিক্রি বা ভাড়ায়। সরাসরি মালিকের সাথে যোগাযোগ।</p>
          <span className="mt-4 inline-block text-blue-600 text-sm font-medium">সব দেখুন →</span>
        </Link>

        <Link href="/construction" className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-300 hover:shadow-md transition-all">
          <Wrench className="w-10 h-10 text-orange-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600">নির্মাণ</h3>
          <p className="text-gray-500 text-sm">বিশ্বস্ত কন্ট্রাক্টর ও ডেভেলপার। পোর্টফোলিও দেখুন, রিভিউ পড়ুন, কোটেশন নিন।</p>
          <span className="mt-4 inline-block text-orange-600 text-sm font-medium">সব দেখুন →</span>
        </Link>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">আপনার সম্পদ বিক্রি বা ভাড়া দিন</h2>
        <p className="text-gray-400 mb-6">বিনামূল্যে বিজ্ঞাপন দিন। লক্ষ ক্রেতার কাছে পৌঁছান।</p>
        <Link href="/post-listing" className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors inline-block">
          এখনই বিজ্ঞাপন দিন
        </Link>
      </section>
    </div>
  )
}
