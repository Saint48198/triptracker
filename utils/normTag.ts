export function normTag(s: string) {
  if (!s) return '';

  const words = s
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/&/g, ' and ') // replace ampersands
    .toLowerCase()
    .split('-')
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, '')) // remove apostrophes
    .filter(Boolean);

  return words
    .map((w, i) => {
      // special-case "iphone" at the start: keep "iPhone"
      if (i === 0 && w === 'iphone') {
        return 'iPhone';
      }
      // capitalize first letter, keep rest lowercase
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join('');
}
