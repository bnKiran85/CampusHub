import { motion } from 'framer-motion';

const Skeleton = ({ className }) => (
  <div className={`animate-shimmer rounded-xl ${className}`} />
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-32 w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="lg:col-span-2 h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map(i => (
      <Skeleton key={i} className="h-20 w-full" />
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <Skeleton key={i} className="h-48 w-full" />
    ))}
  </div>
);

export default Skeleton;
