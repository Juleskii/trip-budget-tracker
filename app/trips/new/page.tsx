'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { TripInsert } from '@/lib/types/database';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'PHP'];

export default function NewTripPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<TripInsert>({
        name: '',
        base_currency: 'USD',
        total_budget: 0,
        start_date: '',
        end_date: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setError('You must be logged in to create a trip');
            setLoading(false);
            return;
        }

        const { data: trip, error: insertError } = await supabase
            .from('trips')
            .insert({
                ...formData,
                end_date: formData.end_date || null,
                created_by: user.id,
            })
            .select()
            .single();

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        // Add creator as trip owner in trip_users
        const { error: memberError } = await supabase
            .from('trip_users')
            .insert({
                trip_id: trip.id,
                user_id: user.id,
                role: 'owner',
            });

        if (memberError) {
            // Trip was created but membership failed - still redirect
            console.error('Failed to add trip membership:', memberError);
        }

        router.push(`/trips/${trip.id}`);
    };

    const updateField = <K extends keyof TripInsert>(field: K, value: TripInsert[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/trips" className="text-sm text-gray-600 hover:text-gray-900">
                    ← Back to trips
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Trip</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div
                            className="bg-red-50 border border-red-200 text-red-700 px-4
   py-3 rounded-lg"
                        >
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium       
  text-gray-700"
                        >
                            Trip Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                            placeholder="e.g., Japan 2024"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="currency"
                                className="block text-sm font-medium 
  text-gray-700"
                            >
                                Currency
                            </label>
                            <select
                                id="currency"
                                value={formData.base_currency}
                                onChange={(e) => updateField('base_currency', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300
   rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500    
  focus:border-transparent"
                            >
                                {CURRENCIES.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="budget"
                                className="block text-sm font-medium   
  text-gray-700"
                            >
                                Total Budget
                            </label>
                            <input
                                id="budget"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.total_budget || ''}
                                onChange={(e) =>
                                    updateField('total_budget', parseFloat(e.target.value) || 0)
                                }
                                className="mt-1 block w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="start_date"
                                className="block text-sm           
  font-medium text-gray-700"
                            >
                                Start Date
                            </label>
                            <input
                                id="start_date"
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => updateField('start_date', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300
   rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500    
  focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="end_date"
                                className="block text-sm font-medium 
  text-gray-700"
                            >
                                End Date <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                                id="end_date"
                                type="date"
                                value={formData.end_date || ''}
                                onChange={(e) => updateField('end_date', e.target.value || null)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300
   rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500    
  focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Link
                            href="/trips"
                            className="px-4 py-2 text-sm font-medium text-gray-700         
  hover:text-gray-900"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium
   rounded-lg hover:bg-blue-700 disabled:opacity-50                            
  disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Trip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
