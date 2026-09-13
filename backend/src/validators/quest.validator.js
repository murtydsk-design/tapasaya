const { QUEST_CATEGORIES, QUEST_DIFFICULTIES } = require('../utils/rpg.constants');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateQuestId(id) {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    return {
      isValid: false,
      message: 'Invalid quest ID format.'
    };
  }
  return { isValid: true };
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validateCreateQuest(data = {}) {
  const { title, description, category, difficulty, type, date, quest_date, start_date, end_date, timer_option } = data;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return {
      isValid: false,
      message: 'Quest title is required and cannot be empty.'
    };
  }

  if (title.trim().length > 150) {
    return {
      isValid: false,
      message: 'Quest title cannot exceed 150 characters.'
    };
  }

  if (!category || typeof category !== 'string' || !QUEST_CATEGORIES[category.toUpperCase()]) {
    return {
      isValid: false,
      message: `Invalid category. Supported categories are: ${Object.keys(QUEST_CATEGORIES).join(', ')}.`
    };
  }

  if (!difficulty || typeof difficulty !== 'string' || !QUEST_DIFFICULTIES[difficulty.toUpperCase()]) {
    return {
      isValid: false,
      message: `Invalid difficulty. Supported difficulties are: ${Object.keys(QUEST_DIFFICULTIES).join(', ')}.`
    };
  }

  const questType = type ? type.toUpperCase() : 'ONE_DAY';
  if (!['DAILY', 'ONE_DAY'].includes(questType)) {
    return {
      isValid: false,
      message: 'Invalid quest type. Must be DAILY or ONE_DAY.'
    };
  }

  const timerOpt = timer_option ? timer_option.toUpperCase() : 'NONE';
  if (!['NONE', '1_HOUR', '2_HOURS', 'FULL_DAY'].includes(timerOpt)) {
    return {
      isValid: false,
      message: 'Invalid timer option. Must be NONE, 1_HOUR, 2_HOURS, or FULL_DAY.'
    };
  }

  let finalQuestDate = null;
  const rawDate = date || quest_date;
  if (questType === 'ONE_DAY') {
    if (rawDate) {
      if (typeof rawDate !== 'string' || !DATE_REGEX.test(rawDate.substring(0, 10))) {
        return {
          isValid: false,
          message: 'Invalid date format. Must be YYYY-MM-DD.'
        };
      }
      finalQuestDate = rawDate.substring(0, 10);
    } else {
      finalQuestDate = new Date().toISOString().substring(0, 10);
    }
  }

  let finalStartDate = null;
  if (start_date) {
    if (typeof start_date !== 'string' || !DATE_REGEX.test(start_date.substring(0, 10))) {
      return {
        isValid: false,
        message: 'Invalid start_date format. Must be YYYY-MM-DD.'
      };
    }
    finalStartDate = start_date.substring(0, 10);
  }

  let finalEndDate = null;
  if (end_date) {
    if (typeof end_date !== 'string' || !DATE_REGEX.test(end_date.substring(0, 10))) {
      return {
        isValid: false,
        message: 'Invalid end_date format. Must be YYYY-MM-DD.'
      };
    }
    finalEndDate = end_date.substring(0, 10);
  }

  if (finalStartDate && finalEndDate && finalStartDate > finalEndDate) {
    return {
      isValid: false,
      message: 'start_date cannot be after end_date.'
    };
  }

  return {
    isValid: true,
    normalizedData: {
      title: title.trim(),
      description: description && typeof description === 'string' ? description.trim() : null,
      category: category.toUpperCase(),
      difficulty: difficulty.toUpperCase(),
      type: questType,
      quest_date: finalQuestDate,
      start_date: finalStartDate,
      end_date: finalEndDate,
      timer_option: timerOpt
    }
  };
}

function validateUpdateQuest(data = {}) {
  const { title, description, category, difficulty, type, date, quest_date, start_date, end_date, timer_option } = data;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return {
        isValid: false,
        message: 'Quest title cannot be empty.'
      };
    }
    if (title.trim().length > 150) {
      return {
        isValid: false,
        message: 'Quest title cannot exceed 150 characters.'
      };
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || !QUEST_CATEGORIES[category.toUpperCase()]) {
      return {
        isValid: false,
        message: `Invalid category. Supported categories are: ${Object.keys(QUEST_CATEGORIES).join(', ')}.`
      };
    }
  }

  if (difficulty !== undefined) {
    if (typeof difficulty !== 'string' || !QUEST_DIFFICULTIES[difficulty.toUpperCase()]) {
      return {
        isValid: false,
        message: `Invalid difficulty. Supported difficulties are: ${Object.keys(QUEST_DIFFICULTIES).join(', ')}.`
      };
    }
  }

  if (type !== undefined) {
    if (typeof type !== 'string' || !['DAILY', 'ONE_DAY'].includes(type.toUpperCase())) {
      return {
        isValid: false,
        message: 'Invalid quest type. Must be DAILY or ONE_DAY.'
      };
    }
  }

  if (timer_option !== undefined) {
    if (typeof timer_option !== 'string' || !['NONE', '1_HOUR', '2_HOURS', 'FULL_DAY'].includes(timer_option.toUpperCase())) {
      return {
        isValid: false,
        message: 'Invalid timer option. Must be NONE, 1_HOUR, 2_HOURS, or FULL_DAY.'
      };
    }
  }

  const normalized = {};
  if (title !== undefined) normalized.title = title.trim();
  if (description !== undefined) normalized.description = typeof description === 'string' ? description.trim() : null;
  if (category !== undefined) normalized.category = category.toUpperCase();
  if (difficulty !== undefined) normalized.difficulty = difficulty.toUpperCase();
  if (type !== undefined) normalized.type = type.toUpperCase();
  if (timer_option !== undefined) normalized.timer_option = timer_option.toUpperCase();

  const rawDate = date || quest_date;
  if (rawDate !== undefined) {
    if (rawDate && (typeof rawDate !== 'string' || !DATE_REGEX.test(rawDate.substring(0, 10)))) {
      return {
        isValid: false,
        message: 'Invalid date format. Must be YYYY-MM-DD.'
      };
    }
    normalized.quest_date = rawDate ? rawDate.substring(0, 10) : null;
  }

  if (start_date !== undefined) {
    if (start_date && (typeof start_date !== 'string' || !DATE_REGEX.test(start_date.substring(0, 10)))) {
      return {
        isValid: false,
        message: 'Invalid start_date format. Must be YYYY-MM-DD.'
      };
    }
    normalized.start_date = start_date ? start_date.substring(0, 10) : null;
  }

  if (end_date !== undefined) {
    if (end_date && (typeof end_date !== 'string' || !DATE_REGEX.test(end_date.substring(0, 10)))) {
      return {
        isValid: false,
        message: 'Invalid end_date format. Must be YYYY-MM-DD.'
      };
    }
    normalized.end_date = end_date ? end_date.substring(0, 10) : null;
  }

  return {
    isValid: true,
    normalizedData: normalized
  };
}

module.exports = {
  validateQuestId,
  validateCreateQuest,
  validateUpdateQuest
};
