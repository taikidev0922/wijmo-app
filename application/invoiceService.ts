"use client";
import { Order } from "@/domains/order";
import html2pdf from "html2pdf.js";

export class InvoiceService {
  generateInvoice(order: Order): Promise<void> {
    const element = this.createInvoiceElement(order);
    const options = this.getPdfOptions(order.orderNo);

    return html2pdf().from(element).set(options).save();
  }

  private createInvoiceElement(order: Order): HTMLElement {
    const mainBlue = "#3C6E9C";
    const lightBlue = "#E7EEF5";

    const element = document.createElement("div");
    element.style.padding = "0";
    element.style.fontFamily =
      "'Helvetica', 'Arial', 'Hiragino Sans', 'Meiryo', sans-serif";
    element.style.color = "#333333";
    element.style.position = "relative";
    element.style.width = "100%";
    element.style.maxWidth = "210mm";
    element.style.margin = "0 auto";

    const header = document.createElement("div");
    header.innerHTML = `
      <div style="border-bottom: 1px solid ${mainBlue}; margin-bottom: 15px; padding-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 24px; margin: 0; font-weight: 500;">請求書</h1>
          </div>
          <div style="text-align: right; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0;">No. : ${order.orderNo}</p>
            <p style="margin: 5px 0 0 0;">請求日 : ${order.orderDate.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 12px; line-height: 1.6;">
        <div style="flex: 1; padding-right: 20px;">
          <div style="margin-bottom: 15px;">
            <p style="margin: 0; color: #666;">〒${
              order.client?.postalCode || ""
            }</p>
            <p style="margin: 2px 0; color: #666;">${
              order.client?.prefecture || ""
            }</p>
            <p style="margin: 2px 0; font-size: 16px; font-weight: 600; color: #333;">${
              order.client?.name || ""
            } 御中</p>
          </div>
          <div>
            <p style="margin: 0;">電話番号: ${order.client?.phone || ""}</p>
          </div>
        </div>
        <div style="flex: 1; text-align: right;">
          <div style="margin-bottom: 15px;">
            <p style="margin: 0; color: #666;">〒123-1234</p>
            <p style="margin: 2px 0; color: #666;">東京都新宿区○○○1-2-3</p>
            <p style="margin: 2px 0; font-size: 16px; font-weight: 600; color: #333;">株式会社日本サンプル</p>
          </div>
          <div>
            <p style="margin: 0;">TEL: 03-1234-5678 FAX: 03-1234-5679</p>
            <p style="margin: 2px 0;">Email: info@example.com</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 15px; border: 1px solid ${mainBlue}; padding: 8px 15px;">
        <p style="margin: 0; font-size: 16px; display: flex; justify-content: space-between;">
          <span>合計金額</span>
          <span>￥${order.orderDetails
            .reduce(
              (sum, detail) =>
                sum + (detail.quantity || 0) * (detail.product?.price || 0),
              0
            )
            .toLocaleString()}-</span>
        </p>
      </div>

      <p style="margin: 0 0 20px 0; font-size: 13px; color: #555;">下記の通り請求いたします。</p>
    `;
    element.appendChild(header);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "25px";
    table.style.fontSize = "12px";

    table.innerHTML = `
      <thead>
        <tr>
          <th style="border: 1px solid ${mainBlue}; padding: 8px; text-align: center; width: 40px; background-color: ${mainBlue}; color: white;">No.</th>
          <th style="border: 1px solid ${mainBlue}; padding: 8px; text-align: left; background-color: ${mainBlue}; color: white;">商品名／品名</th>
          <th style="border: 1px solid ${mainBlue}; padding: 8px; text-align: center; width: 80px; background-color: ${mainBlue}; color: white;">数量</th>
          <th style="border: 1px solid ${mainBlue}; padding: 8px; text-align: right; width: 100px; background-color: ${mainBlue}; color: white;">単価</th>
          <th style="border: 1px solid ${mainBlue}; padding: 8px; text-align: right; width: 120px; background-color: ${mainBlue}; color: white;">金額</th>
        </tr>
      </thead>
      <tbody>
        ${order.orderDetails
          .map(
            (detail, index) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
              index + 1
            }</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              detail.product?.name || ""
            }</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
              detail.quantity || ""
            }</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(
              detail.product?.price || 0
            ).toLocaleString()}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(
              (detail.quantity || 0) * (detail.product?.price || 0)
            ).toLocaleString()}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;
    const totalAmount = order.orderDetails.reduce(
      (sum, detail) =>
        sum + (detail.quantity || 0) * (detail.product?.price || 0),
      0
    );
    const tax = Math.floor(totalAmount * 0.1);

    const tfoot = document.createElement("tfoot");
    tfoot.innerHTML = `
      <tr>
        <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: ${lightBlue};">小計（税抜）</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: ${lightBlue};">${totalAmount.toLocaleString()}</td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: ${lightBlue};">消費税（10%）</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: ${lightBlue};">${tax.toLocaleString()}</td>
      </tr>
      <tr>
        <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: ${lightBlue}; font-weight: 600;">合計（税込）</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: ${lightBlue}; font-weight: 600;">${(
      totalAmount + tax
    ).toLocaleString()}</td>
      </tr>
    `;
    table.appendChild(tfoot);
    element.appendChild(table);

    const remarks = document.createElement("div");
    remarks.style.width = "100%";
    remarks.style.marginTop = "20px";
    remarks.style.borderTop = "1px solid #999";
    remarks.style.paddingTop = "10px";

    const remarkTitle = document.createElement("p");
    remarkTitle.style.margin = "0";
    remarkTitle.style.fontSize = "13px";
    remarkTitle.style.fontWeight = "600";
    remarkTitle.textContent = "備考";
    remarks.appendChild(remarkTitle);

    const remarkContent = document.createElement("p");
    remarkContent.style.margin = "5px 0 0";
    remarkContent.style.fontSize = "12px";
    remarkContent.style.color = "#666";
    remarkContent.style.lineHeight = "1.5";
    remarkContent.style.wordBreak = "break-word";
    remarkContent.style.whiteSpace = "normal";

    const bullet1 = document.createElement("div");
    bullet1.textContent = "・上記商品の代金を請求いたします。";
    remarkContent.appendChild(bullet1);

    const bullet2 = document.createElement("div");
    bullet2.textContent =
      "・お支払いは、お手数ですが下記口座にお願いいたします。";
    remarkContent.appendChild(bullet2);

    const bullet3 = document.createElement("div");
    bullet3.textContent =
      "・支払期限は請求日から30日以内とさせていただきます。";
    remarkContent.appendChild(bullet3);

    remarks.appendChild(remarkContent);
    element.appendChild(remarks);

    return element;
  }

  private getPdfOptions(orderNo: string) {
    return {
      margin: [20, 20, 20, 20] as [number, number, number, number],
      filename: `請求書_${orderNo}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        windowWidth: 1024,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait" as const,
      },
      pagebreak: { mode: "avoid-all" },
    };
  }
}
