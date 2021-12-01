import { PDFDocument, PDFCheckBox, PDFTextField } from 'pdf-lib'
import { Field } from '.'
import { displayRound } from '../irsForms/util'
import { fieldIsNumber } from './Fill'

/**
 * Attempt to fill fields in a PDF from a Form,
 * checking one by one that each pdf field and Form value
 * Make sense by type (checkbox => boolean, textField => string / number)
 */
export function fillPDF(pdf: PDFDocument, fieldValues: Field[]): void {
  const formFields = pdf.getForm().getFields()

  formFields.forEach((pdfField, index) => {
    const value: Field = fieldValues[index]

    const error = (
      expected: string,
      received: boolean | string | undefined | number
    ): Error => {
      return new Error(
        [
          `${pdf.getTitle()}, Field ${index}, ${pdfField.getName()} expected ${expected}, got ${received}`,
          'Nearby:',
          ...formFields
            .slice(
              index - Math.min(index, 20),
              index + Math.min(formFields.length, 20)
            )
            .map(
              (f, i) =>
                `${index - Math.min(index, 20) + i}: ${f.getName()}: ${
                  f instanceof PDFCheckBox ? 'boolean' : 'text'
                }): ${
                  pdfField instanceof PDFCheckBox
                    ? pdfField.isChecked()
                    : (pdfField as PDFTextField).getText()
                } / ${fieldValues[
                  index - 20 + i
                ]?.toString()} / ${typeof fieldValues[index - 20 + i]}`
            )
        ].join('\n')
      )
    }

    if (pdfField instanceof PDFCheckBox) {
      if (value === true) {
        pdfField.check()
      } else if (value !== false && value !== undefined) {
        throw error('boolean', value)
      }
    } else if (pdfField instanceof PDFTextField) {
      try {
        const showValue = fieldIsNumber(value)
          ? displayRound(value)?.toString()
          : value?.toString()
        pdfField.setText(showValue)
      } catch (err) {
        throw error('text field', value)
      }
    }
    pdfField.enableReadOnly()
  })
}
