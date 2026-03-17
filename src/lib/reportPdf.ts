import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";

export async function generatePdfFromElement(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/jpeg", 1.0);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
  return pdf.output("blob");
}

export async function uploadReportPdf(blob: Blob, fileName: string): Promise<string> {
  return uploadReportFile(blob, fileName, "application/pdf");
}

export async function uploadReportFile(
  blob: Blob,
  fileName: string,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from("reports")
    .upload(fileName, blob, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("reports").getPublicUrl(fileName);
  return publicUrl;
}

export function downloadPdfBlob(blob: Blob, fileName: string): void {
  downloadBlob(blob, fileName);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
