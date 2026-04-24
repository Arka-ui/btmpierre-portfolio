/**
 * i18n loader. Static imports keep FR+EN available synchronously for instant
 * language switching. Individual language files live under `js/i18n/` so each
 * can be edited independently and future-lazy-loaded if one grows much larger.
 */

import { fr } from './i18n/fr.js';
import { en } from './i18n/en.js';

export const i18n = {
    config: {
        activeProjects: 0,
        isAvailable: true,
        syncWithDiscord: true
    },
    fr,
    en
};
