import React from 'react';
import Modal from './Modal';
import CreateEvent from '../CreateEvent';

interface CreateEventModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateEventModalWrapper: React.FC<CreateEventModalWrapperProps> = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Event">
      <CreateEvent onSuccess={onSuccess} />
    </Modal>
  );
};

export default CreateEventModalWrapper;
