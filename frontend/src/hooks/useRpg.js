import { useContext } from 'react';
import { RpgContext } from '../context/RpgContext';

export const useRpg = () => {
  const context = useContext(RpgContext);
  if (!context) {
    throw new Error('useRpg must be used within an RpgProvider');
  }
  return context;
};

export default useRpg;
