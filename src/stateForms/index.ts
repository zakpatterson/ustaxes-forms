import F1040 from '../irsForms/F1040'
import { State, Information } from 'ustaxes-core/data'
import Form from 'ustaxes-core/stateForms/Form'

export const stateForm: {
  [K in State]?: (info: Information, f1040: F1040) => Form
} = {}

export const createStateReturn = (
  info: Information,
  f1040: F1040
): Form[] | undefined => {
  const residency = info.stateResidencies[0]
  if (residency !== undefined) {
    const form = stateForm[residency.state]?.call(undefined, info, f1040)
    if (form !== undefined) {
      return [form, ...form?.attachments()].sort(
        (a, b) => a.formOrder - b.formOrder
      )
    }
  }
}
