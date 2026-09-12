import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';
import characterApi from '../services/characterApi';
import questApi from '../services/questApi';

export const RpgContext = createContext(null);

export const RpgProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  const [character, setCharacter] = useState(null);
  const [progress, setProgress] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Level Up Celebration Event State
  const [levelUpData, setLevelUpData] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
  };

  const clearToast = () => {
    setToast(null);
  };

  const refreshRpgData = useCallback(async () => {
    if (!isAuthenticated) {
      setCharacter(null);
      setProgress(null);
      setQuests([]);
      return;
    }

    try {
      setLoading(true);
      const [charRes, progRes, questRes] = await Promise.all([
        characterApi.getCharacter(),
        characterApi.getProgress(),
        questApi.getQuests()
      ]);

      if (charRes.success) setCharacter(charRes.data);
      if (progRes.success) setProgress(progRes.data);
      if (questRes.success) setQuests(questRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshRpgData();
  }, [refreshRpgData]);

  // Complete quest helper that checks for level-up celebration
  const completeQuestAndCheckLevelUp = async (questId) => {
    const prevLevel = character?.level || 1;
    const res = await questApi.completeQuest(questId);

    if (res.success) {
      const newLevel = res.data.character.level;
      if (newLevel > prevLevel) {
        setLevelUpData({
          oldLevel: prevLevel,
          newLevel: newLevel,
          character: res.data.character
        });
      }

      showToast(`Quest complete! +${res.data.quest.xp_reward} XP, +${res.data.quest.gold_reward} Gold (${res.data.completion.attribute} +1)`, 'success');
      await refreshRpgData();
      return res;
    }
    return res;
  };

  return (
    <RpgContext.Provider
      value={{
        character,
        progress,
        quests,
        loading,
        error,
        levelUpData,
        setLevelUpData,
        toast,
        showToast,
        clearToast,
        refreshRpgData,
        completeQuestAndCheckLevelUp
      }}
    >
      {children}
    </RpgContext.Provider>
  );
};
