import { NextResponse } from "next/server"
import ExcelJS from "exceljs"

interface Producto {
  descripcion: string
  codigo: string
  precioUnitario: number
  cantidad: number
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productos, tipoCambio, margen, nombreCompra } = body as {
      productos: Producto[]
      tipoCambio: number
      margen: number
      nombreCompra: string
    }

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet(nombreCompra || "IAN-26")

    // ── Estilos base ──────────────────────────────────────────────
    const headerFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } }
    const subHeaderFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5496" } }
    const altFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } }
    const totalFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } }
    const paramFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2EFDA" } }

    const bold14White: Partial<ExcelJS.Font> = { name: "Arial", bold: true, size: 14, color: { argb: "FFFFFFFF" } }
    const bold11White: Partial<ExcelJS.Font> = { name: "Arial", bold: true, size: 11, color: { argb: "FFFFFFFF" } }
    const bold11: Partial<ExcelJS.Font> = { name: "Arial", bold: true, size: 11 }
    const reg11: Partial<ExcelJS.Font> = { name: "Arial", size: 11 }
    const center: Partial<ExcelJS.Alignment> = { horizontal: "center", vertical: "middle" }
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" },
    }

    // ── Fila 1: título ────────────────────────────────────────────
    ws.mergeCells("A1:J1")
    const titleCell = ws.getCell("A1")
    titleCell.value = `TENDANCE · ${(nombreCompra || "IAN-26").toUpperCase()}`
    titleCell.font = bold14White
    titleCell.fill = headerFill
    titleCell.alignment = center
    ws.getRow(1).height = 28

    // ── Fila 2: encabezados de columna ────────────────────────────
    const headers = [
      "*MARCA*", "DESCRIPCION", "*CODIGO*", "PRECIO UNIT\n(BRL)",
      "CANT.", "TOTAL\n(BRL)", "COSTO UNIT.\nBS", "REFERENCIA\nAL MARGEN",
      "*PRECIO FINAL*", "*DESCUENTOS*",
    ]
    headers.forEach((h, i) => {
      const cell = ws.getCell(2, i + 1)
      cell.value = h
      cell.font = bold11White
      cell.fill = subHeaderFill
      cell.alignment = { ...center, wrapText: true }
      cell.border = thinBorder
    })
    ws.getRow(2).height = 36

    // ── Columnas: anchos ──────────────────────────────────────────
    const colWidths = [12, 36, 14, 14, 8, 14, 14, 16, 16, 14]
    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w })

    // ── Filas de datos ────────────────────────────────────────────
    const dataStart = 3
    productos.forEach((p, idx) => {
      const row = dataStart + idx
      const fill = idx % 2 === 0
        ? ({ type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } } as ExcelJS.Fill)
        : altFill

      const setCell = (col: number, val: ExcelJS.CellValue | string, fmt?: string, fnt?: Partial<ExcelJS.Font>) => {
        const c = ws.getCell(row, col)
        c.value = val
        c.font = fnt ?? reg11
        c.fill = fill
        c.border = thinBorder
        c.alignment = { vertical: "middle", horizontal: col <= 3 ? "left" : "right" }
        if (fmt) c.numFmt = fmt
      }

      setCell(1, "TENDANCE")                             // A: marca
      setCell(2, p.descripcion)                          // B: descripcion
      setCell(3, p.codigo || "")                         // C: codigo
      setCell(4, p.precioUnitario, "#,##0.00")           // D: precio BRL
      setCell(5, p.cantidad, "0", { ...reg11, bold: true }) // E: cant
      // F: total BRL = D*E
      ws.getCell(row, 6).value = { formula: `D${row}*E${row}` }
      ws.getCell(row, 6).numFmt = "#,##0.00"
      ws.getCell(row, 6).font = reg11
      ws.getCell(row, 6).fill = fill
      ws.getCell(row, 6).border = thinBorder
      ws.getCell(row, 6).alignment = { horizontal: "right", vertical: "middle" }
      // G: costo unit BS = precio BRL * tipo de cambio (p1 = totalRow+2)
      ws.getCell(row, 7).value = { formula: `D${row}*$E$${dataStart + productos.length + 2}` }
      ws.getCell(row, 7).numFmt = '"Bs."#,##0.00'
      ws.getCell(row, 7).font = reg11
      ws.getCell(row, 7).fill = fill
      ws.getCell(row, 7).border = thinBorder
      ws.getCell(row, 7).alignment = { horizontal: "right", vertical: "middle" }
      // H: referencia al margen = G*(1+margen%) (p2 = totalRow+3)
      ws.getCell(row, 8).value = { formula: `G${row}*(1+$E$${dataStart + productos.length + 3}/100)` }
      ws.getCell(row, 8).numFmt = '"Bs."#,##0.00'
      ws.getCell(row, 8).font = reg11
      ws.getCell(row, 8).fill = fill
      ws.getCell(row, 8).border = thinBorder
      ws.getCell(row, 8).alignment = { horizontal: "right", vertical: "middle" }
      // I: precio final — vacío para llenado manual
      ws.getCell(row, 9).value = ""
      ws.getCell(row, 9).numFmt = '"Bs."#,##0.00'
      ws.getCell(row, 9).font = reg11
      ws.getCell(row, 9).fill = fill
      ws.getCell(row, 9).border = thinBorder
      ws.getCell(row, 9).alignment = { horizontal: "right", vertical: "middle" }
      // J: descuentos (vacío para llenar)
      ws.getCell(row, 10).value = ""
      ws.getCell(row, 10).fill = fill
      ws.getCell(row, 10).border = thinBorder
    })

    // ── Fila de totales ───────────────────────────────────────────
    const totalRow = dataStart + productos.length
    ws.mergeCells(`A${totalRow}:D${totalRow}`)
    const totalLabel = ws.getCell(`A${totalRow}`)
    totalLabel.value = "TOTALES"
    totalLabel.font = bold11
    totalLabel.fill = totalFill
    totalLabel.alignment = center
    totalLabel.border = thinBorder

    // Totales: E(cant), F(total BRL), G(costo BS), H(ref margen) — I(precio final) vacío para manual
    ;[5, 6, 7, 8].forEach(col => {
      const letter = ["E", "F", "G", "H"][col - 5]
      const c = ws.getCell(totalRow, col)
      c.value = { formula: `SUM(${letter}${dataStart}:${letter}${totalRow - 1})` }
      c.numFmt = col === 5 ? "0" : col <= 6 ? "#,##0.00" : '"Bs."#,##0.00'
      c.font = bold11
      c.fill = totalFill
      c.border = thinBorder
      c.alignment = { horizontal: "right", vertical: "middle" }
    })
    // Columna I total: vacío
    const cI = ws.getCell(totalRow, 9)
    cI.value = ""
    cI.fill = totalFill
    cI.border = thinBorder

    // ── Parámetros ────────────────────────────────────────────────
    const p1 = totalRow + 2  // fila tipo de cambio  = dataStart + productos.length + 2
    const p2 = p1 + 1        // fila margen          = dataStart + productos.length + 3

    ws.mergeCells(`A${p1}:C${p1}`)
    ws.getCell(`A${p1}`).value = "TIPO DE CAMBIO (BRL → Bs.)"
    ws.getCell(`A${p1}`).font = bold11
    ws.getCell(`A${p1}`).fill = paramFill
    ws.getCell(`A${p1}`).border = thinBorder
    ws.getCell(`D${p1}`).value = ""
    ws.getCell(`E${p1}`).value = tipoCambio
    ws.getCell(`E${p1}`).numFmt = "0.0000"
    ws.getCell(`E${p1}`).font = { ...bold11, color: { argb: "FF0070C0" } }
    ws.getCell(`E${p1}`).fill = paramFill
    ws.getCell(`E${p1}`).border = thinBorder
    ws.getCell(`E${p1}`).alignment = { horizontal: "center" }

    ws.mergeCells(`A${p2}:C${p2}`)
    ws.getCell(`A${p2}`).value = "MARGEN DE GANANCIA (%)"
    ws.getCell(`A${p2}`).font = bold11
    ws.getCell(`A${p2}`).fill = paramFill
    ws.getCell(`A${p2}`).border = thinBorder
    ws.getCell(`D${p2}`).value = ""
    ws.getCell(`E${p2}`).value = margen
    ws.getCell(`E${p2}`).numFmt = "0.0"
    ws.getCell(`E${p2}`).font = { ...bold11, color: { argb: "FF0070C0" } }
    ws.getCell(`E${p2}`).fill = paramFill
    ws.getCell(`E${p2}`).border = thinBorder
    ws.getCell(`E${p2}`).alignment = { horizontal: "center" }

    // ── Generar buffer ────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer()

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="factura-${Date.now()}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error generando Excel:", error)
    return NextResponse.json({ error: "Error al generar Excel" }, { status: 500 })
  }
}