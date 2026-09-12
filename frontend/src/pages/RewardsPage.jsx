import React, { useState, useEffect, useCallback } from 'react';
import { useRpg } from '../hooks/useRpg';
import RewardCard from '../components/RewardCard';
import rewardApi from '../services/rewardApi';
import inventoryApi from '../services/inventoryApi';

export const RewardsPage = () => {
  const { character, refreshRpgData, showToast } = useRpg();
  const [rewards, setRewards] = useState([]);
  const [ownedRewardIds, setOwnedRewardIds] = useState(new Set());
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchShopData = useCallback(async () => {
    try {
      setLoading(true);
      const [rewardRes, invRes] = await Promise.all([
        rewardApi.getRewards(),
        inventoryApi.getInventory()
      ]);

      if (rewardRes.success) {
        setRewards(rewardRes.data);
      }

      if (invRes.success) {
        const owned = new Set(invRes.data.map(item => item.reward_id));
        setOwnedRewardIds(owned);
      }
    } catch (err) {
      showToast(err.message || 'Unable to load rewards. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handlePurchased = async (purchaseData) => {
    setOwnedRewardIds(prev => new Set([...prev, purchaseData.reward.id]));
    await refreshRpgData();
  };

  const filteredRewards = rewards.filter(r => {
    return filterType === 'ALL' || r.type === filterType;
  });

  const gold = character?.gold ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Shop Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Your rewards</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Spend your earned Gold to unlock rewards.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'var(--bg-input)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>YOUR GOLD</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fbbf24' }}>{gold} Gold</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '0.65rem 0.85rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-dim)', alignSelf: 'center', fontWeight: 500, fontSize: '0.8rem' }}>Category:</span>
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

      {/* Rewards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading rewards...
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>No rewards available right now.</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            No rewards match your selected category.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.15rem' }}>
          {filteredRewards.map(reward => (
            <RewardCard
              key={reward.id}
              reward={reward}
              isOwned={ownedRewardIds.has(reward.id)}
              onPurchased={handlePurchased}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsPage;

