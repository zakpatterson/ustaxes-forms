import { TaxPayer } from 'ustaxes-forms/data'

// TODO
export default class ScheduleSE {
  tp: TaxPayer

  constructor(tp: TaxPayer) {
    this.tp = tp
  }

  l6 = (): number | undefined => undefined
}
