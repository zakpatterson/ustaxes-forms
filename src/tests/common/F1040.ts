import fc from 'fast-check'
import { Information } from '../../data'
import F1040 from '../../irsForms/F1040'
import Form from '../../irsForms/Form'
import { create1040 } from '../../irsForms/Main'
import { isRight } from '../../util'
import * as arbitraries from '../arbitraries'

export const with1040Property = (
  f: (f1040: [F1040, Form[]]) => void
): fc.IPropertyWithHooks<[Information]> =>
  fc.property(arbitraries.information, (information) => {
    const f1040Res = create1040(information)
    if (isRight(f1040Res)) {
      f(f1040Res.right)
    } else {
      const errs = f1040Res.left
      expect(errs).not.toEqual([])
    }
  })

export const with1040Assert = (f: (f1040: [F1040, Form[]]) => void): void =>
  fc.assert(with1040Property(f))

interface Access<A, B> {
  [k: string]: A | (() => B)
}

export const showForm = (f: Access<unknown, number>): string => {
  return Object.keys(f)
    .filter((k) => k.startsWith('l'))
    .map((k) => {
      if (typeof f[k] === 'function') {
        return `${k}=${(f[k] as () => number)()}`
      }
    })
    .join('\n')
}
