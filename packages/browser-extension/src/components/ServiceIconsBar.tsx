/**
 * ServiceIconsBar Component
 * Displays favorite service icons in the top bar
 */

interface ServiceIcon {
  name: string;
  icon: string;
  color: string;
}

const services: ServiceIcon[] = [
  { name: 'Google', icon: 'G', color: 'bg-red-500' },
  { name: 'Dribbble', icon: '🏀', color: 'bg-pink-500' },
  { name: 'Spline', icon: 'S', color: 'bg-purple-500' },
  { name: 'Facebook', icon: 'f', color: 'bg-blue-600' },
  { name: 'PayPal', icon: 'P', color: 'bg-blue-500' },
  { name: 'Raiffeisen', icon: 'R', color: 'bg-yellow-500' },
];

interface ServiceIconsBarProps {
  onServiceClick?: (serviceName: string) => void;
}

export function ServiceIconsBar({ onServiceClick }: ServiceIconsBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white overflow-x-auto">
      {services.map((service) => (
        <button
          key={service.name}
          className="service-icon flex-shrink-0"
          onClick={() => onServiceClick?.(service.name)}
          title={service.name}
        >
          <div
            className={`w-8 h-8 rounded-full ${service.color} flex items-center justify-center text-white font-bold text-sm`}
          >
            {service.icon}
          </div>
        </button>
      ))}
      <button className="icon-btn flex-shrink-0 ml-2" title="More">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>
    </div>
  );
}
