import React, { useState } from 'react';
import { useRpg } from '../hooks/useRpg';
import rewardApi from '../services/rewardApi';

export const RewardCard = ({ reward, isOwned, onPurchased }) => {
  const { character, refreshRpgData, showToast } = useRpg();
  const [buying, setBuying] = useState(false);

  const userGold = character?.gold ?? 0;
  const canAfford = userGold >= reward.price;
  const isAvailable = reward.is_available;

  const handlePurchase = async () => {
    if (isOwned || !isAvailable || buying) return;

    setBuying(true);
    try {
      const res = await rewardApi.purchaseReward(reward.id);
      if (res.success) {
        showToast('Reward purchased.', 'success');
        await refreshRpgData();
        if (onPurchased) onPurchased(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Unable to buy reward. Please try again.', 'error');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      gap: '1rem',
      opacity: !isAvailable ? 0.6 : 1
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--cyan)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            {reward.type}
          </span>
          {isOwned ? (
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              Owned
            </span>
          ) : !isAvailable ? (
            <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--rose)' }}>
              Unavailable
            </span>
          ) : null}
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
        <div style={{
          fontWeight: 700,
          color: 'var(--gold)',
          fontSize: '1rem'
        }}>
          {reward.price} Gold
        </div>

        {isOwned ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--emerald)', fontWeight: 600 }}>
            Owned
          </span>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={buying || !isAvailable || !canAfford}
            className="btn-gold"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', opacity: (!canAfford || !isAvailable) ? 0.6 : 1 }}
          >
            {buying ? 'Buying...' : 'Buy'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardCard;


