import React, { useState, useEffect, useCallback } from 'react';
import { useRpg } from '../hooks/useRpg';
import InventoryCard from '../components/InventoryCard';
import inventoryApi from '../services/inventoryApi';

export const InventoryPage = () => {
  const { showToast } = useRpg();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getInventory();
      if (res.success) {
        setInventoryItems(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Unable to load inventory. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredItems = inventoryItems.filter(item => {
    return filterType === 'ALL' || item.reward?.type === filterType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Inventory Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Your inventory</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Rewards you have purchased and unlocked.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>OWNED ITEMS</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {inventoryItems.length} {inventoryItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '0.65rem 0.85rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-dim)', alignSelf: 'center', fontWeight: 500, fontSize: '0.8rem' }}>Type:</span>
        {['ALL', 'THEME', 'BADGE', 'COSMETIC', 'PROFILE_ITEM'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: filterType === type ? 'var(--primary)' : 'var(--badge-bg)',
              color: filterType === type ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '0.775rem'
            }}
          >
            {type === 'ALL' ? 'All' : type === 'PROFILE_ITEM' ? 'Profile item' : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Inventory Items Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading inventory...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>Your inventory is empty.</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Buy a reward to see it here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.15rem' }}>
          {filteredItems.map(item => (
            <InventoryCard
              key={item.id}
              item={item}
              onEquipToggle={fetchInventory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;

