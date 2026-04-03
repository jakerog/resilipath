'use client';

import React from 'react';
import { SkeuomorphicContainer } from '@/components/layout/SkeuomorphicContainer';
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ReviewSummaryProps {
  plans: any[];
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ plans }) => {
  const now = new Date();

  const overduePlans = plans.filter(p =>
    p.nextReviewAt && p.nextReviewAt.toDate() < now
  );

  const upcomingPlans = plans.filter(p => {
    if (!p.nextReviewAt) return false;
    const reviewDate = p.nextReviewAt.toDate();
    const thirtyDaysOut = new Date();
    thirtyDaysOut.setDate(now.getDate() + 30);
    return reviewDate >= now && reviewDate <= thirtyDaysOut;
  });

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <SkeuomorphicContainer className="flex items-center gap-4">
        <div className={clsx(
          "p-3 rounded-xl neumorphic-inset",
          overduePlans.length > 0 ? "text-brand-danger" : "text-brand-success"
        )}>
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-brand-primary">{overduePlans.length}</p>
          <p className="text-[10px] font-bold uppercase text-brand-secondary opacity-60">Overdue Reviews</p>
        </div>
      </SkeuomorphicContainer>

      <SkeuomorphicContainer className="flex items-center gap-4">
        <div className="p-3 rounded-xl neumorphic-inset text-brand-warning">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-brand-primary">{upcomingPlans.length}</p>
          <p className="text-[10px] font-bold uppercase text-brand-secondary opacity-60">Due within 30 days</p>
        </div>
      </SkeuomorphicContainer>

      <SkeuomorphicContainer className="flex items-center gap-4">
        <div className="p-3 rounded-xl neumorphic-inset text-brand-accent">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-brand-primary">
            {plans.filter(p => p.status === 'approved').length}
          </p>
          <p className="text-[10px] font-bold uppercase text-brand-secondary opacity-60">Approved Plans</p>
        </div>
      </SkeuomorphicContainer>
    </div>
  );
};
