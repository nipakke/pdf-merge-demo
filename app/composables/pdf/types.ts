import type { PDFEntity } from "~/lib/pdf/db/entities";



export type InputType = File | Blob | PDFEntity
export type LivePDFOptions = {
  id: string;
  file: InputType
}