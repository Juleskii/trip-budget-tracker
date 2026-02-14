'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { showToast } from '@/components/ui/toast';

type Member = {
  user_id: string;
  role: 'owner' | 'member';
  email?: string;
};

type Props = {
  tripId: string;
  members: Member[];
  currentUserId: string;
  isOwner: boolean;
};

export function TripMembers({ tripId, members, currentUserId, isOwner }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const supabase = createClient();

      // Look up user by email
      const { data: users, error: lookupError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (lookupError || !users) {
        // Try auth.users via RPC or just show error
        setError('User not found. They must have an account first.');
        setLoading(false);
        return;
      }

      // Check if already a member
      const existingMember = members.find((m) => m.user_id === users.id);
      if (existingMember) {
        setError('This user is already a member of this trip.');
        setLoading(false);
        return;
      }

      // Add to trip_users
      const { error: insertError } = await supabase.from('trip_users').insert({
        trip_id: tripId,
        user_id: users.id,
        role: 'member',
      });

      if (insertError) {
        setError('Failed to add member. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(`${email} has been added to the trip!`);
      setEmail('');
      showToast(`${email} has been added to the trip!`, 'success');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the trip?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('trip_users')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    if (error) {
      showToast('Failed to remove member', 'error');
      return;
    }

    showToast('Member removed successfully', 'success');
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Members</h2>

      <ul className="divide-y divide-gray-200 mb-4">
        {members.map((member) => (
          <li key={member.user_id} className="py-3 flex items-center justify-between">
            <div>
              <p className="text-gray-900">{member.email || 'Unknown user'}</p>
              <p className="text-sm text-gray-500 capitalize">{member.role}</p>
            </div>
            {isOwner && member.user_id !== currentUserId && (
              <button
                onClick={() => handleRemove(member.user_id)}
                className="text-sm text-red-600 hover:text-red-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg px-3 py-2 transition-colors min-h-[44px]"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={handleInvite} className="border-t pt-4">
          <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-2">
            Invite by email
          </label>
          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
              {success}
            </div>
          )}
          <div className="flex gap-2">
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
              className="flex-1 px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors inline-flex items-center gap-2"
            >
              {loading && <Spinner className="h-4 w-4" />}
              {loading ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
