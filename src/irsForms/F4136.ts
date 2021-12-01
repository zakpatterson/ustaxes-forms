import { TaxPayer } from '../data'
import { Field } from '../pdfFiller'
import Form, { FormTag } from './Form'

/**
 * TODO: not implemented
 * Credit for federal tax on fuels
 */
export default class F4136 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f4136'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  credit = (): number | undefined => undefined

  fields = (): Field[] => []
}
