import { TaxPayer } from '../data'
import { Field } from '../pdfFiller'
import Form, { FormTag } from './Form'

/**
 * TODO: Credit for child and dependent care expenses
 */
export default class F2441 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f2441'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  credit = (): number | undefined => undefined

  fields = (): Field[] => []
}
