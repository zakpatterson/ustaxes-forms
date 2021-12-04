import Fill from 'ustaxes-core/pdfFiller/Fill'

export type FormTag =
  | 'f1040'
  | 'f1040v'
  | 'f1040s1'
  | 'f1040s2'
  | 'f1040s3'
  | 'f1040sa'
  | 'f1040sb'
  | 'f1040sc'
  | 'f1040sd'
  | 'f1040se'
  | 'f1040sr'
  | 'f1040sei'
  | 'f1040s8'
  | 'f2439'
  | 'f2441'
  | 'f2555'
  | 'f4136'
  | 'f4563'
  | 'f4797'
  | 'f4952'
  | 'f4972'
  | 'f5695'
  | 'f8959'
  | 'f8960'
  | 'f8814'
  | 'f8863'
  | 'f8888'
  | 'f8910'
  | 'f8936'
  | 'f8962'
  | 'f8995'
  | 'f8995a'

/**
 * Base interface for what every form implementation should include.
 * Any PDF can be filled from an array of values.
 *
 */
export default abstract class Form extends Fill {
  // Match the filename without extension when downloaded from IRS
  abstract tag: FormTag
  // Match the sequence number in the header of the PDF.
  abstract sequenceIndex: number

  public toString = (): string => `
    Form ${this.tag}, at sequence ${this.sequenceIndex}
  `
}
