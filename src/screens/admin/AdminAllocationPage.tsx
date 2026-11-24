import React from 'react';

interface AdminAllocationPageProps {
  onRoundRun?: () => void;
}

export const AdminAllocationPage = ({ onRoundRun }: AdminAllocationPageProps) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Allocation</h1>
    </div>
  );
};