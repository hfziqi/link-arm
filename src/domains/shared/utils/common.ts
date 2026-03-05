export const sanitizeTitle = (title: string): string => {
  return title.replace(/\.(txt|docx|md|markdown)$/i, '').trim()
}

export const sanitizeTitleForId = (title: string): string => {
  return title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
}

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

const generateUniqueId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}_${random}`;
}

export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  const extra = Math.random().toString(36).substr(2, 5);

  return `${timestamp}_${random}_${extra}`;
}

export const generatePrefixedId = (prefix: string): string => {
  return `${prefix}_${generateUniqueId()}`;
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export const debounce = <T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
