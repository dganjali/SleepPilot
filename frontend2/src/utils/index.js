export function createPageUrl(pageName) {
  return `/${pageName.toLowerCase()}`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
