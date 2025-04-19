import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { BellIcon } from '@heroicons/react/24/outline';

const NotificationCenter: React.FC = () => {
  const { notifications } = useSocket();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 relative"
      >
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-1">
            <div className="px-4 py-2 font-medium text-gray-700 border-b">
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No new notifications
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 border-b"
                  >
                    <p className="text-sm text-gray-800">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(
                        notification?.timestamp || ''
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
