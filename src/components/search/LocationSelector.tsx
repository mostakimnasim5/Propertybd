'use client'

import { useEffect, useState } from 'react'
import { Division, District } from '@/types'
import { BD_LOCATIONS } from '@/lib/locations'

interface LocationSelectorProps {
  onDistrictChange: (districtId: number | null, districtName: string) => void
  defaultDistrictId?: number
  className?: string
}

export default function LocationSelector({ onDistrictChange, defaultDistrictId, className = '' }: LocationSelectorProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>('')
  const [districts, setDistricts] = useState<{ name: string; nameBn: string }[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')

  // Build flat district list with IDs (index-based for now, matches seed order)
  const handleDivisionChange = (divisionName: string) => {
    setSelectedDivision(divisionName)
    setSelectedDistrict('')
    onDistrictChange(null, '')

    const division = BD_LOCATIONS.find(d => d.name === divisionName)
    setDistricts(division?.districts || [])
  }

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName)
    // We pass name for now; backend can resolve ID
    const division = BD_LOCATIONS.find(d => d.name === selectedDivision)
    const idx = division?.districts.findIndex(d => d.name === districtName)
    onDistrictChange(idx !== undefined && idx >= 0 ? idx + 1 : null, districtName)
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={selectedDivision}
        onChange={e => handleDivisionChange(e.target.value)}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      >
        <option value="">বিভাগ বেছে নিন</option>
        {BD_LOCATIONS.map(div => (
          <option key={div.name} value={div.name}>{div.nameBn}</option>
        ))}
      </select>

      <select
        value={selectedDistrict}
        onChange={e => handleDistrictChange(e.target.value)}
        disabled={!selectedDivision}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:opacity-50"
      >
        <option value="">জেলা বেছে নিন</option>
        {districts.map(d => (
          <option key={d.name} value={d.name}>{d.nameBn}</option>
        ))}
      </select>
    </div>
  )
}
