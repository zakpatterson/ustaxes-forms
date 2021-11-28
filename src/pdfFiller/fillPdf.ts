import { PDFDocument, PDFCheckBox, PDFTextField } from 'pdf-lib'
import { Field } from '.'

/**
 * Attempt to fill fields in a PDF from a Form,
 * checking one by one that each pdf field and Form value
 * Make sense by type (checkbox => boolean, textField => string / number)
 */
export function fillPDF(pdf: PDFDocument, fieldValues: Field[]): void {
  const formFields = pdf.getForm().getFields()

  formFields.forEach((pdfField, index) => {
    const value: Field = fieldValues[index]

    const error = (expected: string): Error => {
      return new Error(
        `Field ${index}, ${pdfField.getName()} expected ${expected}`
      )
    }

    if (pdfField instanceof PDFCheckBox) {
      if (value === true) {
        pdfField.check()
      } else if (value !== false && value !== undefined) {
        throw error('boolean')
      }
    } else if (pdfField instanceof PDFTextField) {
      try {
        pdfField.setText(value?.toString())
      } catch (err) {
        throw error('text field')
      }
    }
    pdfField.enableReadOnly()
  })
}
