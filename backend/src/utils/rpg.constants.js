/**
 * TAPASYA (Life RPG) Core Game Rules Constants
 * Source of Truth: RULES.md, DATABASE.md, PRD.md
 */

const QUEST_CATEGORIES = {
  FITNESS: 'FITNESS',
  CODING: 'CODING',
  STUDY: 'STUDY',
  MEDITATION: 'MEDITATION',
  PRODUCTIVITY: 'PRODUCTIVITY'
};

const QUEST_DIFFICULTIES = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};

// RULES.md Section 3.2: Difficulty Reward Values
const DIFFICULTY_REWARDS = {
  EASY: { xp_reward: 20, gold_reward: 10 },
  MEDIUM: { xp_reward: 40, gold_reward: 20 },
  HARD: { xp_reward: 75, gold_reward: 40 }
};

// RULES.md Section 6.1: Category -> Attribute Mapping
const CATEGORY_ATTRIBUTE_MAP = {
  FITNESS: 'Strength',
  CODING: 'Intellect',
  STUDY: 'Knowledge',
  MEDITATION: 'Focus',
  PRODUCTIVITY: 'Discipline'
};

module.exports = {
  QUEST_CATEGORIES,
  QUEST_DIFFICULTIES,
  DIFFICULTY_REWARDS,
  CATEGORY_ATTRIBUTE_MAP
};
