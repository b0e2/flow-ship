type ClassDictionary = Record<string, boolean | null | undefined>
type ClassValue = string | number | false | null | undefined | ClassDictionary

export function cn(...inputs: ClassValue[]) {
  return inputs
    .flatMap((input) => {
      if (!input) {
        return []
      }

      if (typeof input === 'string' || typeof input === 'number') {
        return [String(input)]
      }

      return Object.entries(input)
        .filter(([, isEnabled]) => Boolean(isEnabled))
        .map(([className]) => className)
    })
    .join(' ')
}
