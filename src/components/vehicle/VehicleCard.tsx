import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Gauge, Star } from 'lucide-react'
import { Vehicle } from '@/types'

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'নতুন', EXCELLENT: 'চমৎকার', GOOD: 'ভালো', FAIR: 'মোটামুটি',
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `${(price / 10000000).toFixed(1)} কোটি`
  if (price >= 100000) return `${(price / 100000).toFixed(1)} লাখ`
  return `${(price / 1000).toFixed(0)}K`
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const primaryImage = vehicle.images?.find(i => i.isPrimary) || vehicle.images?.[0]

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
      <div className="relative h-48 bg-gray-100">
        {primaryImage ? (
          <Image src={primaryImage.url} alt={vehicle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">কোনো ছবি নেই</div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vehicle.purpose === 'RENT' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'}`}>
            {vehicle.purpose === 'RENT' ? 'ভাড়া' : 'বিক্রি'}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/90 text-gray-700">
            {vehicle.type === 'CAR' ? 'কার' : 'বাইক'}
          </span>
        </div>
        {vehicle.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> ফিচার্ড
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-green-600 transition-colors">
          {vehicle.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{vehicle.brand} {vehicle.model} · {vehicle.year}</p>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{vehicle.district.name}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
          <span className="bg-gray-100 px-2 py-0.5 rounded">{CONDITION_LABELS[vehicle.condition]}</span>
          {vehicle.mileage && (
            <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {vehicle.mileage.toLocaleString()} কিমি</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-green-600 font-bold text-base">৳ {formatPrice(vehicle.price)}</span>
            {vehicle.purpose === 'RENT' && <span className="text-xs text-gray-500">/দিন</span>}
          </div>
          {vehicle.owner?.nidVerified && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">✓ যাচাই</span>
          )}
        </div>
      </div>
    </Link>
  )
}
