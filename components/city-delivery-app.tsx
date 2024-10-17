'use client'

import React, { useState, useEffect } from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, subQuarters, startOfYear, endOfYear, format } from 'date-fns'

interface City {
  city: string;
  delivery_count: number;
}

export function CityDeliveryApp() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([startOfMonth(new Date()), endOfMonth(new Date())])
  const [startDate, endDate] = dateRange;
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (startDate && endDate) {
      fetchDeliveries()
    }
  }, [startDate, endDate])

  const fetchDeliveries = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      const targetUrl = `https://ratio.sketchdesign.ma/fetch_deliveries.php?startDate=${startDateStr}&endDate=${endDateStr}`;
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      setCities(data as City[]);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching deliveries. Please try again. ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const predefinedRanges: { label: string; value: [Date, Date] }[] = [
    { label: "This Month", value: [startOfMonth(new Date()), endOfMonth(new Date())] },
    { label: "Last Month", value: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
    { label: "This Quarter", value: [startOfQuarter(new Date()), endOfQuarter(new Date())] },
    { label: "Last Quarter", value: [startOfQuarter(subQuarters(new Date(), 1)), endOfQuarter(subQuarters(new Date(), 1))] },
    { label: "This Year", value: [startOfYear(new Date()), endOfYear(new Date())] }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <header className="bg-blue-600 text-white p-6">
          <h1 className="text-3xl font-bold">City Delivery App</h1>
        </header>
        <main className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Select Date Range</h2>
            <div className="flex flex-wrap items-center gap-4">
              <DatePicker
                selectsRange={true}
                startDate={startDate || undefined}
                endDate={endDate || undefined}
                onChange={(update: [Date | null, Date | null]) => {
                  setDateRange(update);
                }}
                className="p-2 border rounded"
              />
              <div className="flex flex-wrap gap-2">
                {predefinedRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => setDateRange(range.value)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Cities Ranked by Deliveries</h2>
            {loading && <p className="text-gray-600">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <ul className="space-y-4">
                {cities.map((city, index) => (
                  <li key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm transition duration-300 ease-in-out hover:shadow-md">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-blue-600">{city.city}</h3>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {city.delivery_count} deliveries
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
