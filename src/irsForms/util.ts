export const displayNumber = (n: number | undefined): number | undefined => {
  if (n === undefined || n <= 0) {
    return undefined
  }
  return Math.round(n)
}

export const displayRound = (n: number | undefined): number | undefined =>
  Math.round(n ?? 0) === 0 ? undefined : Math.round(n ?? 0)

export const displayNegPos = (n: number | undefined): string => {
  const r = Math.round(n ?? 0)
  if (r === 0) return ''
  if (r < 0) return `(${Math.abs(r)})`
  return r.toString()
}

export const computeField = (f: number | undefined): number => f ?? 0

export const sumFields = (fs: Array<number | undefined>): number =>
  fs.map((f) => computeField(f)).reduce((l, r) => l + r, 0)
