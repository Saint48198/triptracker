import { useState } from 'react';

const ConfirmAction: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  message: string;
  isLoading: boolean;
}> = ({ isOpen, onClose, onConfirm, message, isLoading }) => {
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setError('Failed to perform action');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg w-96">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Confirm Action</h2>
        </div>
        <div className="px-6 py-4">
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <p>{message}</p>
        </div>
        <div className="px-6 py-4 flex justify-end space-x-4 border-t">
          <button
            onClick={onClose}
            type={'button'}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            type={'button'}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAction;
