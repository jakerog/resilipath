import React from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { where } from 'firebase/firestore';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { Users } from 'lucide-react';
import { clsx } from 'clsx';

interface UserPresenceProps {
  exerciseId: string;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ exerciseId }) => {
  const { data: presences, loading } = useFirestoreQuery('presence', [
    where('exerciseId', '==', exerciseId),
    where('status', '==', 'online')
  ]);

  if (loading) return null;

  return (
    <SkeuomorphicContainer className="flex items-center gap-4 py-3">
      <div className="flex items-center gap-2 text-brand-success font-bold text-xs uppercase tracking-widest">
        <Users className="w-4 h-4" />
        Live Participants
      </div>
      <div className="flex -space-x-3 overflow-hidden">
        {presences.map((p: any) => (
          <div
            key={p.uid}
            className="inline-block h-8 w-8 rounded-full ring-2 ring-[#e0e5ec] bg-brand-accent text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-lg"
            title={p.displayName || p.email}
          >
            {(p.displayName || p.email || '?').charAt(0)}
          </div>
        ))}
        {presences.length === 0 && (
          <span className="text-[10px] text-brand-secondary opacity-40 italic">
            Waiting for participants...
          </span>
        )}
      </div>
    </SkeuomorphicContainer>
  );
};
