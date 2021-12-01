import * as fc from 'fast-check'
import { PDFDocument, PDFField, PDFTextField } from 'pdf-lib'
import { create1040PDFs } from '../../irsForms'
import * as arbitraries from '../../tests/arbitraries'
import { Information } from '../../data'
import { localPDFs } from '../../tests/common/LocalForms'
//import prand from 'pure-rand'
import { Parameters } from 'fast-check'
import { isRight } from '../../util'

jest.setTimeout(120 * 1000)

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  // PDF-lib creates console warning on every creation due to no XFA support
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

const findBadDecimalFormat = (
  field: PDFField,
  places = 2
): [string, string] | undefined => {
  if (field instanceof PDFTextField) {
    const text = field.getText()
    if (text !== undefined && !isNaN(Number(text))) {
      const numberParts = text.split('.')
      if (numberParts.length === 2 && numberParts[1].length !== places) {
        return [field.getName(), text]
      }
    }
  }
}

const with1040Pdfs = async (
  f: (pdfs: PDFDocument[], info: Information) => void,
  params: Parameters<[Information]> = {
    // This might take a long time as many pdfs have to be rendered
    // So by default just run for 1 minute max and hope
    interruptAfterTimeLimit: 60 * 1000
  }
): Promise<void> =>
  fc.assert(
    fc.asyncProperty(arbitraries.information, async (info) => {
      const pdfs = await create1040PDFs(info)(localPDFs)
      if (isRight(pdfs)) {
        f(pdfs.right, info)
      }
    }),
    params
  )

describe('pdfHandler', () => {
  it('every field has only two decimal places max', async () => {
    await with1040Pdfs((pdfs) => {
      type FieldError = [number, [string, string]]
      type PdfErrors = [string, FieldError[]]

      // Specific fields that have different rounding instructions:
      const exceptionFields: [string, number, number][] = [
        ['2021 Schedule 8812 (Form 1040)', 66, 3]
      ]

      const badFields: PdfErrors[] = pdfs.flatMap((pdf, i): PdfErrors[] => {
        const pdfBadFields: FieldError[] = pdf
          .getForm()
          .getFields()
          .flatMap((field, i) => {
            const places =
              exceptionFields.find(
                ([name, index]) => name === pdf.getTitle() && index === i
              )?.[2] ?? 2

            const fieldValue = findBadDecimalFormat(field, places)
            if (fieldValue !== undefined) {
              return [[i, fieldValue]] as FieldError[]
            }
            return [] as FieldError[]
          })

        if (pdfBadFields.length > 0) {
          return [[pdf.getTitle() ?? `pdf-${i}`, pdfBadFields]]
        } else {
          return [] as PdfErrors[]
        }
      })
      expect(badFields).toEqual([])
    })
  })

  it('taxpayer name found in header of all forms', async () => {
    await with1040Pdfs((pdfs, info) => {
      if (pdfs.length === 0) {
        // Ingore cases where info led to no forms
        return true
      }

      const firstNameNotInHeader: PDFDocument[] = pdfs.filter(
        (pdf) =>
          !pdf
            .getForm()
            .getFields()
            .slice(0, 20)
            .some(
              (field) =>
                field instanceof PDFTextField &&
                field
                  .getText()
                  ?.startsWith(info.taxPayer.primaryPerson?.firstName ?? '')
            )
      )

      expect(firstNameNotInHeader).toEqual([])
    })
  })
})
