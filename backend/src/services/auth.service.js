const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_tapasya_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generates a signed JWT authentication token for a user ID.
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Formats standard avatar payload object for user records.
 * Priority order: custom_avatar_url > avatar_id > google_avatar_url > default avatar ('avatar_01')
 */
function formatUserAvatar(userRow) {
  const googleUrl = userRow.google_avatar_url || null;
  const customUrl = userRow.custom_avatar_url || null;
  const type = userRow.avatar_type || (customUrl ? 'custom' : (googleUrl ? 'google' : 'preset'));
  const id = userRow.avatar_id || 'avatar_01';

  let activeUrl = id;
  if (type === 'custom' && customUrl) {
    activeUrl = customUrl;
  } else if (type === 'google' && googleUrl) {
    activeUrl = googleUrl;
  }

  return {
    type,
    id,
    googleUrl,
    customUrl,
    url: activeUrl
  };
}

/**
 * Registers a new user executing an atomic database transaction.
 * Creates users record, character starting state, and streak record in one transaction.
 */
async function registerUser({ name, email, password }) {
  // 1. Check if email already exists
  const existingUserRes = await db.query('SELECT id FROM users WHERE email = $1;', [email]);
  if (existingUserRes.rows.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Hash password securely
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Execute Database Transaction for Atomic Account Creation
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Insert User
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, avatar_type, avatar_id)
       VALUES ($1, $2, $3, 'preset', 'avatar_01')
       RETURNING id, name, email, created_at, google_avatar_url, custom_avatar_url, avatar_type, avatar_id;`,
      [name, email, passwordHash]
    );
    const user = userRes.rows[0];

    // Insert Character with Default Starting Stats (Level 1, 0 XP, 0 Gold, all category completion counts = 0)
    await client.query(
      `INSERT INTO characters (user_id, level, total_xp, gold, strength, intellect, focus, knowledge, discipline)
       VALUES ($1, 1, 0, 0, 0, 0, 0, 0, 0);`,
      [user.id]
    );

    // Insert Streak Record (DATABASE.md: current_streak = 0, best_streak = 0)
    await client.query(
      `INSERT INTO streaks (user_id, current_streak, best_streak)
       VALUES ($1, 0, 0);`,
      [user.id]
    );

    await client.query('COMMIT');

    // Generate JWT Token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        avatar: formatUserAvatar(user)
      },
      token
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Authenticates user credentials and issues a JWT token.
 */
async function loginUser({ email, password }) {
  // Find user by email
  const userRes = await db.query(
    'SELECT id, name, email, password_hash, created_at, google_avatar_url, custom_avatar_url, avatar_type, avatar_id FROM users WHERE email = $1;',
    [email]
  );

  if (userRes.rows.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const user = userRes.rows[0];

  // Verify password hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT Token
  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      avatar: formatUserAvatar(user)
    },
    token
  };
}

/**
 * Retrieves safe user profile details by User ID without password hash.
 */
async function getUserById(userId) {
  const userRes = await db.query(
    'SELECT id, name, email, phone_number, created_at, google_avatar_url, custom_avatar_url, avatar_type, avatar_id FROM users WHERE id = $1;',
    [userId]
  );

  if (userRes.rows.length === 0) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = userRes.rows[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone_number || null,
    phone_number: user.phone_number || null,
    created_at: user.created_at,
    avatar: formatUserAvatar(user)
  };
}

/**
 * Authenticates user via Google OAuth ID Token (credential).
 * Verifies token signature with Google's public keys.
 * If user exists, logs them in.
 * If user does not exist, creates account and initializes RPG character.
 */
async function googleLogin(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    const error = new Error('Google credential token is required.');
    error.statusCode = 400;
    throw error;
  }

  const { OAuth2Client } = require('google-auth-library');
  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    payload = ticket.getPayload();
  } catch (err) {
    const error = new Error('Invalid or unverified Google authentication token.');
    error.statusCode = 401;
    throw error;
  }

  if (!payload || !payload.email) {
    const error = new Error('Google authentication payload missing email.');
    error.statusCode = 400;
    throw error;
  }

  const email = payload.email.trim().toLowerCase();
  const name = payload.name || email.split('@')[0];
  const googlePicture = payload.picture || null;

  // 1. Check if user already exists
  const userRes = await db.query(
    'SELECT id, name, email, created_at, google_avatar_url, custom_avatar_url, avatar_type, avatar_id FROM users WHERE email = $1;',
    [email]
  );

  let user;

  if (userRes.rows.length > 0) {
    user = userRes.rows[0];
    // Update google_avatar_url if provided and different
    if (googlePicture && user.google_avatar_url !== googlePicture) {
      const updateRes = await db.query(
        `UPDATE users
         SET google_avatar_url = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, name, email, created_at, google_avatar_url, custom_avatar_url, avatar_type, avatar_id;`,
        [googlePicture, user.id]
      );
      user = updateRes.rows[0];
    }
  } else {
    // 2. Create new user account safely
    const crypto = require('crypto');
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 10);
    const initialAvatarType = googlePicture ? 'google' : 'preset';

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const newUserRes = await client.query(
        `INSERT INTO users (name, email, password_hash, avatar_type, avatar_id)
         VALUES ($1, $2, $3, $4, $5, 'avatar_01')
         RETURNING id, name, email, created_at, google_avatar_url, custom_avatar_url, avatar_type, avatar_id;`,
        [name, email, passwordHash, googlePicture, initialAvatarType]
      );
      user = newUserRes.rows[0];

      // Initialize Character (Level 1, 0 XP, 0 Gold, all category completion counts = 0)
      await client.query(
        `INSERT INTO characters (user_id, level, total_xp, gold, strength, intellect, focus, knowledge, discipline)
         VALUES ($1, 1, 0, 0, 0, 0, 0, 0, 0);`,
        [user.id]
      );

      // Initialize Streaks record
      await client.query(
        `INSERT INTO streaks (user_id, current_streak, best_streak)
         VALUES ($1, 0, 0);`,
        [user.id]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      avatar: formatUserAvatar(user)
    },
    token
  };
}

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getUserById,
  generateToken,
  formatUserAvatar
};
