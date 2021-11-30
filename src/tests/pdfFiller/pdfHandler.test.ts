import * as fc from 'fast-check'
import { PDFDocument, PDFField, PDFTextField } from 'pdf-lib'
import { create1040PDFs } from '../../irsForms'
import * as arbitraries from '../../tests/arbitraries'
import { Information } from '../../data'
import { localPDFs } from '../../tests/common/LocalForms'
import { Parameters } from 'fast-check'
import { F1040Error } from '../../irsForms/F1040'

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

const with1040pdfs = async (
  f: (pdfs: PDFDocument[], info: Information) => void,
  assertParams: Parameters<Information[]> = {}
): Promise<void> =>
  fc.assert(
    fc.asyncProperty(arbitraries.information, async (info) => {
      const pdfs = await create1040PDFs(info)(localPDFs).catch((err) => {
        if (err instanceof Array) {
          expect(err as F1040Error[]).not.toEqual([])
          return []
        } else {
          throw err
        }
      })
      expect(
        pdfs.filter((pdf) => pdf.getForm().getFields().length === 0)
      ).toEqual([])
      f(pdfs, info)
    }),
    assertParams
  )

describe('pdfHandler', () => {
  it('every field has only two decimal places max', async () => {
    await with1040pdfs(
      (pdfs) => {
        type FieldError = [number, [string, string]]
        type PdfErrors = [string, FieldError[]]
        const badFields: PdfErrors[] = pdfs.flatMap((pdf, i): PdfErrors[] => {
          const pdfBadFields: FieldError[] = pdf
            .getForm()
            .getFields()
            .flatMap((field, i) => {
              const fieldValue = findBadDecimalFormat(field)
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
      },
      {
        interruptAfterTimeLimit: 100 * 1000 // 100 seconds
      }
    )
  })

  test('taxpayer name found in header of all forms', async () => {
    await with1040pdfs(
      (pdfs, info) => {
        if (pdfs.length === 0) {
          // Ingore cases where info led to no forms
          return true
        }

        const formsHeaderFields: PDFField[][] = pdfs.map((pdf) => {
          if (pdf.getForm() === undefined) {
            console.error(`pdf ${pdf.getTitle()} has no form`)
          }
          if (pdf.getForm().getFields().length === 0) {
            console.error(`pdf ${pdf.getTitle()} has no fields`)
          }
          return pdf.getForm().getFields().slice(0, 10)
        })

        const firstNameNotInHeader: PDFField[][] = formsHeaderFields.filter(
          (fields) =>
            !fields.some(
              (field) =>
                field instanceof PDFTextField &&
                field.getText() === info.taxPayer.primaryPerson?.firstName
            )
        )
        formsHeaderFields.forEach((fs) => {
          expect(fs).toHaveLength(10)
        })
        expect(formsHeaderFields).toHaveLength(pdfs.length)
        expect(firstNameNotInHeader).toEqual([])
      },
      {
        interruptAfterTimeLimit: 100 * 1000 // 100 seconds
      }
    )
  })
})
