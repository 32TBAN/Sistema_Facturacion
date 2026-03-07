export function expiresInToDate(expiresIn) {
  const now = Date.now();
  const match = /^(\d+)([mhd])$/.exec(expiresIn);

  if (!match) {
    return new Date(now + 7 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const map = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(now + value * map[unit]);
}
