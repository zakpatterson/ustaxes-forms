import { Field } from '../pdfFiller'
import { TaxPayer } from '../data'
import Form, { FormTag } from './Form'

export default class ScheduleR extends Form {
  tp: TaxPayer
  tag: FormTag = 'f1040sr'
  sequenceIndex = 999

  constructor(tp: TaxPayer) {
    super()
    this.tp = tp
  }

  l22 = (): number | undefined => undefined

  fields = (): Field[] => []
}
