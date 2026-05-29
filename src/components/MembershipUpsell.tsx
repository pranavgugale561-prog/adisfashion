'use client';

import { useStore } from '@/store/useStore';
import { ShieldCheck } from 'lucide-react';

export default function MembershipUpsell() {
  const { isMember, toggleMembership } = useStore();

  if (isMember) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-indigo-900">Become a Member</p>
          <p className="text-xs text-indigo-700 mt-1">
            Get exclusive member-only prices and save up to 30% on every order!
          </p>
          <button
            onClick={toggleMembership}
            className="mt-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            Activate Free Membership
          </button>
        </div>
      </div>
    </div>
  );
}
