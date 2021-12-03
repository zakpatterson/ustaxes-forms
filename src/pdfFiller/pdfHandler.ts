import { PDFDocument } from 'pdf-lib'
import Fill from './Fill'
import { fillPDF } from './fillPdf'

export interface PDFDownloader {
  (url: string): Promise<PDFDocument>
}

export const makeDownloader =
  (baseUrl: string): PDFDownloader =>
  async (url: string): Promise<PDFDocument> => {
    const download = await fetch(`${baseUrl}${url}`)
    const buffer = await download.arrayBuffer()
    return await PDFDocument.load(buffer)
  }

// Removes all form information from the PDF
const flattenValues = async (pdf: PDFDocument): Promise<PDFDocument> => {
  const pageBytes = await pdf.save()
  return await PDFDocument.load(pageBytes)
}

export const combinePdfs = (pdfFiles: PDFDocument[]): Promise<PDFDocument> => {
  const [head, ...rest] = pdfFiles

  // Make sure we combine the documents from left to right and preserve order
  return rest.reduce(async (l, r) => {
    const doc = await l
    const nextDoc = await flattenValues(r)
    return await doc
      .copyPages(nextDoc, nextDoc.getPageIndices())
      .then((pgs) => {
        pgs.forEach((p) => doc.addPage(p))
        return doc
      })
  }, flattenValues(head))
}

// Modify documents in place, filling in the form fields
export const getPdfs = (formData: Array<[Fill, PDFDocument]>): PDFDocument[] =>
  // Insert the values from each field into the PDF
  formData.map(([data, f]) => {
    fillPDF(f, data.renderedFields())
    return f
  })
