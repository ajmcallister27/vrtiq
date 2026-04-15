export const RATING_MODES = ['ski', 'snowboard'];

export const RATING_MODE_LABELS = {
  ski: 'Ski',
  snowboard: 'Snowboard',
};

export function normalizeRatingMode(mode) {
  return mode === 'snowboard' ? 'snowboard' : 'ski';
}

export function getRatingModeLabel(mode) {
  return RATING_MODE_LABELS[normalizeRatingMode(mode)];
}
