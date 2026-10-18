// "https://www.habr.com/ru/articles/1/" -> "habr.com"
export function displayHost(input: string): string {
  try {
    return new URL(input).hostname.replace(/^www\./, '')
  } catch {
    return input
  }
}
