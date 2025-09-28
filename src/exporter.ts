import fs from "fs";
import { Parser } from "json2csv";
import * as XLSX from "xlsx";
import { ProfileAnalysis } from "./openai";

// Exporta resultados para CSV
export function exportToCSV(results: ProfileAnalysis[], filename = "results.csv") {
  const parser = new Parser();
  const csv = parser.parse(results);
  fs.writeFileSync(filename, csv, "utf-8");
  console.log(`✅ CSV salvo em ${filename}`);
}

// Exporta resultados para Excel
export function exportToExcel(results: ProfileAnalysis[], filename = "results.xlsx") {
  const worksheet = XLSX.utils.json_to_sheet(results);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Análises");

  XLSX.writeFile(workbook, filename);
  console.log(`✅ Excel salvo em ${filename}`);
}
