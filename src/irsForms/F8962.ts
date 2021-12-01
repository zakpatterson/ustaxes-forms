import { TaxPayer } from '../data'
import { Field } from '../pdfFiller'
import Form, { FormTag } from './Form'

/**
 * TODO: Not yet implemented
 * Net premium tax credit
 */
export default class F8962 extends Form {
  tp: TaxPayer
  tag: FormTag = 'f8962'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  credit = (): number | undefined => undefined

  fields = (): Field[] => []
}
