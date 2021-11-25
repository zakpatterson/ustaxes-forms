import fc from 'fast-check'
import F1040 from '../irsForms/F1040'
import Form from '../irsForms/Form'
import { create1040 } from '../irsForms/Main'
import { isRight } from '../util'
import * as arbitraries from './arbitraries'

const with1040 = (f: (f1040: [F1040, Form[]]) => void): void =>
  fc.assert(
    fc.property(arbitraries.information, (information) => {
      const f1040Res = create1040(information)
      if (isRight(f1040Res)) {
        f(f1040Res.right)
      } else {
        const errs = f1040Res.left
        expect(errs).not.toEqual([])
      }
    })
  )

describe('f1040', () => {
  it('should be created in', () => {
    with1040(([f1040, forms]) => {
      expect(f1040.errors()).toEqual([])
      expect(forms).not.toEqual([])
    })
  })

  it('should not create duplicate schedules in', () => {
    with1040(([, forms]) => {
      expect(new Set(forms.map((a) => a.tag)).size).toEqual(forms.length)
      expect(new Set(forms.map((a) => a.sequenceIndex)).size).toEqual(
        forms.length
      )
    })
  })

  it('should arrange attachments according to sequence order', () => {
    with1040(([, forms]) => {
      expect(forms.sort((a, b) => a.sequenceIndex - b.sequenceIndex)).toEqual(
        forms
      )
    })
  })

  it('should never produce higher tax than income', () => {
    with1040(([f1040]) => {
      // tax is less than taxable income
      if (f1040.l15() ?? 0 > 0) {
        expect(f1040.l24()).toBeLessThan(f1040.l15() ?? 0)
      } else {
        expect(f1040.l24() ?? 0).toEqual(0)
      }
    })
  })
})
