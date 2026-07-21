import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Maximize2, BedDouble, Bath, Star } from 'lucide-react'
import { Listing } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  FLAT: 'ফ্ল্যাট', HOUSE: 'বাড়ি', SHOP: 'দোকান',
  OFFICE: 'অফিস', LAND: 'জমি', BUILDING: 'ভবন', WAREHOUSE: 'গুদাম',
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `${(price / 10000000).toFixed(1)} কোটি`
  if (price >= 100000) return `${(price / 100000).toFixed(1)} লাখ`
  if (price >= 1000) return `${(price / 1000).toFixed(0)}K`
  return price.toLocaleString('bn-BD')
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const primaryImage = listing.images?.find(i => i.isPrimary) || listing.images?.[0]

  return (
    <Link href={`/properties/${listing.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            কোনো ছবি নেই
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${listing.purpose === 'RENT' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'}`}>
            {listing.purpose === 'RENT' ? 'ভাড়া' : 'বিক্রি'}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/90 text-gray-700">
            {TYPE_LABELS[listing.type] || listing.type}
          </span>
        </div>

        {listing.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> ফিচার্ড
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {listing.areaName ? `${listing.areaName}, ` : ''}{listing.district.name}
          </span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
          {listing.area && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> {listing.area} sqft
            </span>
          )}
          {listing.bedrooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3 h-3" /> {listing.bedrooms} বেড
            </span>
          )}
          {listing.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="w-3 h-3" /> {listing.bathrooms} বাথ
            </span>
          )}
        </div>

        {/* Price + verified */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-green-600 font-bold text-base">৳ {formatPrice(listing.price)}</span>
            {listing.purpose === 'RENT' && <span className="text-xs text-gray-500">/মাস</span>}
            {listing.negotiable && <span className="text-xs text-gray-400 ml-1">(আলোচনাসাপেক্ষ)</span>}
          </div>
          {listing.owner?.nidVerified && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">✓ যাচাই</span>
          )}
        </div>
      </div>
    </Link>
  )
}
