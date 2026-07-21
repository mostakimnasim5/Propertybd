export type UserRole = 'BUYER' | 'OWNER' | 'BROKER' | 'BUILDER' | 'ADMIN'

export interface User {
  id: string
  phone: string
  email?: string
  name?: string
  role: UserRole
  isVerified: boolean
  nidVerified: boolean
  profileImage?: string
  createdAt: string
}

export type ListingType = 'FLAT' | 'HOUSE' | 'SHOP' | 'OFFICE' | 'LAND' | 'BUILDING' | 'WAREHOUSE'
export type ListingPurpose = 'SALE' | 'RENT'
export type ListingStatus = 'PENDING' | 'ACTIVE' | 'SOLD' | 'RENTED' | 'REJECTED' | 'EXPIRED'

export interface ListingImage {
  id: string
  url: string
  isPrimary: boolean
}

export interface Listing {
  id: string
  title: string
  description: string
  type: ListingType
  purpose: ListingPurpose
  price: number
  negotiable: boolean
  area?: number
  bedrooms?: number
  bathrooms?: number
  floor?: number
  totalFloors?: number
  facing?: string
  furnished: boolean
  parking: boolean
  gasLine: boolean
  lift: boolean
  images: ListingImage[]
  address: string
  mapLat?: number
  mapLng?: number
  districtId: number
  district: { name: string; nameBn: string }
  upazila?: { name: string; nameBn: string }
  areaName?: string
  status: ListingStatus
  isFeatured: boolean
  viewCount: number
  owner: { id?: string; name?: string; nidVerified: boolean }
  createdAt: string
}

export type VehicleType = 'CAR' | 'BIKE'
export type VehiclePurpose = 'SALE' | 'RENT'
export type VehicleCondition = 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR'

export interface VehicleImage {
  id: string
  url: string
  isPrimary: boolean
}

export interface Vehicle {
  id: string
  title: string
  description: string
  type: VehicleType
  purpose: VehiclePurpose
  brand: string
  model: string
  year: number
  price: number
  negotiable: boolean
  mileage?: number
  condition: VehicleCondition
  color?: string
  fuelType?: string
  transmission?: string
  images: VehicleImage[]
  address: string
  districtId: number
  district: { name: string; nameBn: string }
  areaName?: string
  status: ListingStatus
  isFeatured: boolean
  viewCount: number
  owner: { id?: string; name?: string; nidVerified: boolean }
  createdAt: string
}

export interface Construction {
  id: string
  companyName: string
  description: string
  services: string[]
  experience: number
  portfolio: { id: string; title: string; imageUrl: string }[]
  districtId: number
  district: { name: string; nameBn: string }
  address: string
  coverImage?: string
  status: ListingStatus
  isFeatured: boolean
  owner: { id?: string; name?: string; nidVerified: boolean }
  reviews: Review[]
  createdAt: string
}

export interface Review {
  id: string
  rating: number
  comment?: string
  reviewer: { name?: string }
  createdAt: string
}

export interface Division {
  id: number
  name: string
  nameBn: string
  districts: District[]
}

export interface District {
  id: number
  name: string
  nameBn: string
  divisionId: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
