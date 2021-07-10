
export type FormTag =
  'f1040' |
  'f1040v' |
  'f1040s1' |
  'f1040s2' |
  'f1040s3' |
  'f1040sb' |
  'f1040sd' |
  'f1040se' |
  'f1040sei' |
  'f1040s8' |
  'f8959'

/**
  * Base interface for what every form implementation should include.
  * Any PDF can be filled from an array of values.
  *
  */
export default interface Form {
  tag: FormTag
  fields: () => Array<string | number | boolean | undefined>
}
