import React from 'react';

export const KpiSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white p-4 rounded border border-slate-200 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 bg-slate-200 rounded animate-shimmer w-20"></div>
          <div className="w-4 h-4 bg-slate-200 rounded animate-shimmer"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded animate-shimmer w-16"></div>
        <div className="h-2 bg-slate-200 rounded animate-shimmer w-24"></div>
      </div>
    ))}
  </div>
);

export const ResearchCardSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-4 bg-white border border-slate-200 rounded space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded animate-shimmer w-28"></div>
          <div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div>
        </div>
        <div className="h-4 bg-slate-200 rounded animate-shimmer w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded animate-shimmer w-1/2"></div>
        <div className="h-10 bg-slate-100 rounded border border-slate-200 p-2 flex justify-between">
          <div className="h-3 bg-slate-200 rounded animate-shimmer w-20"></div>
          <div className="h-3 bg-slate-200 rounded animate-shimmer w-20"></div>
          <div className="h-3 bg-slate-200 rounded animate-shimmer w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

export const SourcesTableSkeleton = () => (
  <div className="divide-y divide-slate-100">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-3 flex justify-between items-center bg-white">
        <div className="h-4 bg-slate-200 rounded animate-shimmer w-48"></div>
        <div className="h-4 bg-slate-200 rounded animate-shimmer w-24"></div>
        <div className="h-4 bg-slate-200 rounded animate-shimmer w-32"></div>
        <div className="h-4 bg-slate-200 rounded animate-shimmer w-16"></div>
      </div>
    ))}
  </div>
);
