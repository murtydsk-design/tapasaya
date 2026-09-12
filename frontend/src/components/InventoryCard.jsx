import React, { useState } from 'react';
import { useRpg } from '../hooks/useRpg';
import inventoryApi from '../services/inventoryApi';

export const InventoryCard = ({ item, onEquipToggle }) => {
  const { showToast } = useRpg();
  const [equipping, setEquipping] = useState(false);

  const reward = item.reward || {};
  const isEquipped = item.is_equipped;

  const handleEquip = async () => {
    if (equipping) return;

    setEquipping(true);
    try {
      const res = await inventoryApi.equipItem(item.id);
      if (res.success) {
        const action = res.data.is_equipped ? 'equipped' : 'unequipped';
        showToast(`Item ${action}.`, 'success');
        if (onEquipToggle) onEquipToggle();
      }
    } catch (err) {
      showToast(err.message || 'Unable to update item. Please try again.', 'error');
    } finally {
      setEquipping(false);
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      gap: '1rem',
      borderColor: isEquipped ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-color)'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-hover)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            {reward.type}
          </span>
          {isEquipped && (
            <span className="badge" style={{ background: 'var(--primary)', color: '#ffffff' }}>
              Equipped
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.25rem', fontWeight: 600 }}>
          {reward.name}
        </h3>
        {reward.description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {reward.description}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Acquired {new Date(item.acquired_at).toLocaleDateString()}
        </span>

        <button
          onClick={handleEquip}
          disabled={equipping}
          className={isEquipped ? 'btn-secondary' : 'btn-primary'}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
        >
          {equipping ? 'Updating...' : (isEquipped ? 'Unequip' : 'Equip')}
        </button>
      </div>
    </div>
  );
};

export default InventoryCard;

