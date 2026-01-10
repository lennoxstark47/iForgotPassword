/**
 * Logo Component
 */

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-12 h-12 text-3xl',
    lg: 'w-16 h-16 text-4xl',
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <div className={`${sizes[size]} flex items-center justify-center bg-primary-600 text-white rounded-lg font-bold`}>
        iF
      </div>
      <span className="font-bold text-gray-800">iForgotPassword</span>
    </div>
  );
}
