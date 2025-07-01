import React from 'react';

interface GeoPermissionModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const GeoPermissionModal: React.FC<GeoPermissionModalProps> = ({ isOpen, onAccept, onReject }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center border-2 border-tangoGold animate-fadeIn">
        <h2 className="text-lg font-bold mb-2 text-tangoBlue">Allow location access?</h2>
        <p className="mb-4 text-tangoGreen-dark text-sm">
          To show you the most relevant tango events near you, we need to access your location. Your location is only used to filter events by county and is never stored.
        </p>
        <div className="flex flex-col gap-2">
          <button
            className="bg-tangoBlue text-white px-4 py-2 rounded hover:bg-tangoGold transition"
            onClick={onAccept}
          >
            Allow location
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onReject}
          >
            Choose county manually
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeoPermissionModal;
