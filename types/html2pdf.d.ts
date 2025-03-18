declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      [key: string]: string | number | boolean | undefined;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: "portrait" | "landscape";
      [key: string]: string | undefined;
    };
    pagebreak?: {
      mode?: string;
      avoid?: string[];
      [key: string]: string | string[] | undefined;
    };
    [key: string]: unknown;
  }

  interface Html2PdfInstance {
    from(element: HTMLElement | string): Html2PdfInstance;
    set(options: Html2PdfOptions): Html2PdfInstance;
    save(): Promise<void>;
    output(type: string, options?: Record<string, unknown>): Promise<unknown>;
    then(callback: (result: void) => void): Html2PdfInstance;
    catch(callback: (error: Error) => void): Html2PdfInstance;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(
    element: HTMLElement | string,
    options?: Html2PdfOptions
  ): Promise<void>;

  export = html2pdf;
}
