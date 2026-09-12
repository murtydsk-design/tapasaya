-- ===================================================
-- TAPASYA (Life RPG) Seed Virtual Rewards
-- Documentation: DATABASE.md, RULES.md
-- ===================================================

INSERT INTO rewards (id, name, description, type, price, is_available)
VALUES 
    (
        'a1111111-1111-1111-1111-111111111111',
        'Cyberpunk Neon Theme',
        'Futuristic dark theme with neon cyan and magenta accents',
        'THEME',
        100,
        TRUE
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        'Retro Pixel 16-Bit Theme',
        'Nostalgic 16-bit arcade UI color palette',
        'THEME',
        150,
        TRUE
    ),
    (
        'b1111111-1111-1111-1111-111111111111',
        'Novice Warrior Badge',
        'Awarded to dedicated adventurers starting their journey',
        'BADGE',
        50,
        TRUE
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'Code Wizard Badge',
        'Proof of mastery over intricate software algorithms',
        'BADGE',
        75,
        TRUE
    ),
    (
        'c1111111-1111-1111-1111-111111111111',
        'Golden Aura Avatar Frame',
        'Glowing golden perimeter for your profile character avatar',
        'COSMETIC',
        200,
        TRUE
    ),
    (
        'd1111111-1111-1111-1111-111111111111',
        'Master Tactician Title',
        'Special profile banner displaying your strategic discipline',
        'PROFILE_ITEM',
        120,
        TRUE
    )
ON CONFLICT (id) DO NOTHING;
