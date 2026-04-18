export const formatElapsedDuration = (elapsedMilliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMilliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (!minutes) return `${seconds}s`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

