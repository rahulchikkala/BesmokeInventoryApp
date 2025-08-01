import React from 'react';
import InventoryOperations from './InventoryOperations';

const RecentOperations: React.FC = () => (
  <InventoryOperations title="Recent Inventory Operations" limit={10} />
);

export default RecentOperations;