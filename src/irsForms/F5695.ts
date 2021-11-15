import { Field } from 'ustaxes-forms/pdfFiller'
import { TaxPayer } from 'ustaxes-forms/data'
import Form, { FormTag } from './Form'

/**
 * Not implemented yet
 */
export default class F5695 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f5695'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l30 = (): number | undefined => undefined

  fields = (): Field[] => []
}
