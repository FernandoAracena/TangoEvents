import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  // Usar portal para renderizar el modal en el body y evitar stacking context
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overscroll-contain">
      <div className="fixed inset-0 w-full h-full max-w-full max-h-full sm:relative sm:inset-auto sm:w-full sm:max-w-md sm:h-auto sm:max-h-[90vh] bg-white rounded-none sm:rounded-lg shadow-lg p-2 sm:p-6 mx-0 sm:mx-2 overflow-y-auto overflow-x-auto">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {title && <h2 className="text-2xl font-bold mb-4 text-tangoBlue text-center">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
