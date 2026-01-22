'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Props = {
    tripId: string;
    tripName: string;
};

export function DeleteTripButton({ tripId, tripName }: Props) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        const supabase = createClient();

        const { error } = await supabase.from('trips').delete().eq('id', tripId);

        if (error) {
            alert('Failed to delete trip: ' + error.message);
            setLoading(false);
            return;
        }

        router.push('/trips');
        router.refresh();
    };

    if (showConfirm) {
        return (
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Delete "{tripName}"?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-600   
  rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700           
  hover:text-gray-900"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border  
  border-red-300 rounded-lg hover:bg-red-50"
        >
            Delete
        </button>
    );
}
