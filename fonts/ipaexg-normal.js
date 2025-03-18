import { jsPDF } from "jspdf";

var font = "AAEAAAAKAIAAAwAgT1MvMgAAAAAAAACsAAAAWGNtYXAAA...";

jsPDF.API.events.push([
  "addFonts",
  function () {
    this.addFileToVFS("ipaexg-normal.ttf", font);
    this.addFont("ipaexg-normal.ttf", "ipaexg", "normal");
  },
]);
