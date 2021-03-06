import * as fc from 'fast-check'
import { PDFDocument, PDFField, PDFTextField } from 'pdf-lib'
import { create1040PDFs } from 'ustaxes-forms/irsForms'
import * as arbitraries from 'ustaxes-forms/tests/arbitraries'
import { Information } from 'ustaxes-forms/data'
import { localPDFs } from 'ustaxes-forms/tests/common/LocalForms'

jest.setTimeout(120 * 1000)

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  // PDF-lib creates console warning on every creation due to no XFA support
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

const findBadDecimalFormat = (
  field: PDFField
): [string, string] | undefined => {
  if (field instanceof PDFTextField) {
    const text = field.getText()
    if (text !== undefined && !isNaN(Number(text))) {
      const numberParts = text.split('.')
      if (numberParts.length === 2 && numberParts[1].length !== 2) {
        return [field.getName(), text]
      }
    }
  }
}

/**
 * Run a test for a given return, and report on [pdf title, [fieldName, testResult]] for
 * each field that has a malformatted number.
 */
const testEveryField = async <A>(
  info: Information,
  fieldMatch: (field: PDFField) => A | undefined
): Promise<[string, [number, A][]][]> => {
  const schedules: PDFDocument[] = await create1040PDFs(info)(localPDFs)
  return schedules.flatMap((pdf, i) => {
    const pdfBadFields: [number, A][] = pdf
      .getForm()
      .getFields()
      .flatMap((field, i) => {
        const fieldValue = fieldMatch(field)
        if (fieldValue !== undefined) {
          return [[i, fieldValue]]
        }
        return []
      })

    if (pdfBadFields.length > 0) {
      return [[pdf.getTitle() ?? `pdf-${i}`, pdfBadFields]]
    } else {
      return []
    }
  })
}

describe('pdfHandler', () => {
  it('every field has only two decimal places max', async () => {
    await fc.assert(
      fc.asyncProperty(arbitraries.information, async (info) => {
        expect(await testEveryField(info, findBadDecimalFormat)).toHaveLength(0)
      }),
      {
        interruptAfterTimeLimit: 100 * 1000 // 100 seconds
      }
    )
  })
})
