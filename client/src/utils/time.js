export const formatRelativeTime = (timestamp) => {
  if (!timestamp) {
    return null;
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const diffMs = Date.now() - date.getTime();

  if (diffMs < 60_000) {
    return 'just now';
  }

  if (diffMs < 3_600_000) {
    const minutes = Math.floor(diffMs / 60_000);
    return `${minutes}m ago`;
  }

  if (diffMs < 86_400_000) {
    const hours = Math.floor(diffMs / 3_600_000);
    return `${hours}h ago`;
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
