import { Field } from 'ustaxes-forms/pdfFiller'
import { TaxPayer } from 'ustaxes-forms/data'
import Form, { FormTag } from './Form'

/**
 * Not implemented yet
 */
export default class F4972 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f4972'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  tax = (): number => 0

  fields = (): Field[] => []
}
