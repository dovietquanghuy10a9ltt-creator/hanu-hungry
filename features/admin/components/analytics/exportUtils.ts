import type { SystemAccount, UserStreakRankingItem, ExportStudentItem } from "./types";

/**
 * Lọc tài khoản sinh viên (loại trừ Admin) và sắp xếp theo chuỗi hiện tại cao nhất tại thời điểm xuất file giảm dần.
 * Dữ liệu chuẩn bị cho xuất file gồm: STT, Thành viên, MSSV, Email, Chuỗi hiện tại.
 */
export function prepareStudentExportData(
  accounts: SystemAccount[],
  streakRanking?: UserStreakRankingItem[]
): ExportStudentItem[] {
  // 1. Lọc bỏ 100% tài khoản có vai trò ADMIN
  const studentAccounts = accounts.filter((acc) => acc.role !== "ADMIN");

  // 2. Ghép dữ liệu chuỗi ngày từ streakRanking
  const streakMap = new Map<string, UserStreakRankingItem>();
  if (streakRanking) {
    for (const item of streakRanking) {
      streakMap.set(item.userId, item);
      if (item.studentCode) {
        streakMap.set(`code:${item.studentCode}`, item);
      }
    }
  }

  // 3. Chuẩn hóa dữ liệu kèm chuỗi ngày
  const enriched = studentAccounts.map((acc) => {
    const streakItem = streakMap.get(acc.id) || streakMap.get(`code:${acc.student_code}`);
    return {
      displayName: acc.display_name || "Thành viên",
      studentCode: acc.student_code || "—",
      email: acc.email || "—",
      longestStreak: streakItem ? streakItem.longestStreak : 0,
      currentStreak: streakItem ? streakItem.currentStreak : 0,
      createdAt: acc.created_at,
    };
  });

  // 4. Sắp xếp theo chuỗi hiện tại tại thời điểm xuất file giảm dần (currentStreak giảm dần -> longestStreak giảm dần -> ngày tạo)
  enriched.sort((a, b) => {
    if (b.currentStreak !== a.currentStreak) {
      return b.currentStreak - a.currentStreak;
    }
    if (b.longestStreak !== a.longestStreak) {
      return b.longestStreak - a.longestStreak;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 5. Gán chỉ mục index STT (1, 2, 3...)
  return enriched.map((item, index) => ({
    stt: index + 1,
    displayName: item.displayName,
    studentCode: item.studentCode,
    email: item.email,
    longestStreak: item.longestStreak,
    currentStreak: item.currentStreak,
  }));
}

/**
 * Định dạng ngày giờ Việt Nam cho tên file
 */
function getTimestampString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

/**
 * Định dạng ngày giờ tiếng Việt đầy đủ cho văn bản in ấn
 */
function formatDateTimeVN(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}, ngày ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Thoát các ký tự XML đặc biệt để bảo vệ tài liệu
 */
function escapeXml(unsafe: string | number): string {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Thoát các ký tự HTML đặc biệt
 */
function escapeHtml(unsafe: string | number): string {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sinh nội dung SpreadsheetML (Excel XML) hỗ trợ định dạng bảng, màu sắc tiêu đề và font Unicode tiếng Việt
 */
export function generateExcelXml(students: ExportStudentItem[]): string {
  const rowsXml = students
    .map(
      (s) => `      <Row>
        <Cell ss:StyleID="Center"><Data ss:Type="Number">${s.stt}</Data></Cell>
        <Cell ss:StyleID="Text"><Data ss:Type="String">${escapeXml(s.displayName)}</Data></Cell>
        <Cell ss:StyleID="StudentCode"><Data ss:Type="String">${escapeXml(s.studentCode)}</Data></Cell>
        <Cell ss:StyleID="Text"><Data ss:Type="String">${escapeXml(s.email)}</Data></Cell>
        <Cell ss:StyleID="CenterBold"><Data ss:Type="Number">${s.currentStreak}</Data></Cell>
      </Row>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1f1b1a"/>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#B51B2C" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#8B1522"/>
      </Borders>
    </Style>
    <Style ss:ID="Center">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5DED7"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5DED7"/>
      </Borders>
    </Style>
    <Style ss:ID="CenterBold">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#D9480F"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5DED7"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5DED7"/>
      </Borders>
    </Style>
    <Style ss:ID="StudentCode">
      <NumberFormat ss:Format="@"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5DED7"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5DED7"/>
      </Borders>
    </Style>
    <Style ss:ID="Text">
      <NumberFormat ss:Format="@"/>
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5DED7"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5DED7"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="Hanu_SinhVien_ChuoiNgay">
    <Table ss:DefaultRowHeight="20">
      <Column ss:Width="50"/>
      <Column ss:Width="160"/>
      <Column ss:Width="140"/>
      <Column ss:Width="230"/>
      <Column ss:Width="130"/>
      <Row ss:Height="28">
        <Cell ss:StyleID="Header"><Data ss:Type="String">STT</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Thành viên</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Mã sinh viên (MSSV)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Email</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Chuỗi hiện tại (Ngày)</Data></Cell>
      </Row>
${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;
}

/**
 * Sinh nội dung CSV với UTF-8 BOM (\uFEFF) mở trong Excel tiếng Việt không bị lỗi font
 */
export function generateCsvContent(students: ExportStudentItem[]): string {
  const BOM = "\uFEFF";
  const headers = ["STT", "Thành viên", "Mã sinh viên (MSSV)", "Email", "Chuỗi hiện tại (Ngày)"];
  const rows = students.map((s) => [
    s.stt,
    `"${s.displayName.replace(/"/g, '""')}"`,
    `"${s.studentCode}"`,
    `"${s.email.replace(/"/g, '""')}"`,
    s.currentStreak,
  ]);

  return (
    BOM +
    headers.join(",") +
    "\n" +
    rows.map((row) => row.join(",")).join("\n")
  );
}

/**
 * Tải file Excel (.xls) xuống máy tính người dùng
 */
export function exportToExcelFile(students: ExportStudentItem[]): void {
  if (typeof window === "undefined") return;

  const xmlContent = generateExcelXml(students);
  const blob = new Blob([xmlContent], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `HanuHungry_DanhSach_SinhVien_ChuoiNgay_${getTimestampString()}.xls`;

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Sinh mã HTML trang in A4 chuẩn hành chính cho PDF
 */
export function generatePrintablePdfHtml(students: ExportStudentItem[]): string {
  const now = new Date();
  const formattedDate = formatDateTimeVN(now);

  const tableRows = students
    .map(
      (s) => `      <tr>
        <td class="center font-bold">${s.stt}</td>
        <td><strong>${escapeHtml(s.displayName)}</strong></td>
        <td class="center font-mono">${escapeHtml(s.studentCode)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td class="center"><span class="streak-badge">🔥 ${s.currentStreak} ngày</span></td>
      </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Hanu Hungry - Danh Sách Xếp Hạng Chuỗi Sinh Viên</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm 15mm 10mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1f1b1a;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.4;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #b51b2c;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      color: #b51b2c;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 10px;
      color: #756561;
      font-weight: 500;
    }
    .meta-info {
      text-align: right;
      font-size: 10px;
      color: #555555;
    }
    .doc-title-container {
      text-align: center;
      margin-bottom: 14px;
    }
    .doc-title {
      font-size: 15px;
      font-weight: 900;
      text-transform: uppercase;
      color: #1f1b1a;
      margin: 0 0 4px 0;
      letter-spacing: 0.3px;
    }
    .doc-subtitle {
      font-size: 10.5px;
      color: #756561;
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    thead {
      display: table-header-group;
    }
    th {
      background-color: #fcf4f2;
      color: #8b1522;
      font-weight: 800;
      border: 1px solid #d9cece;
      padding: 6px 5px;
      text-align: left;
    }
    th.center, td.center {
      text-align: center;
    }
    td {
      border: 1px solid #e5ded7;
      padding: 5px 6px;
      vertical-align: middle;
    }
    tr {
      page-break-inside: avoid;
    }
    tr:nth-child(even) {
      background-color: #fdfbf8;
    }
    .font-bold {
      font-weight: 700;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 600;
    }
    .streak-badge {
      display: inline-block;
      padding: 1.5px 7px;
      background-color: #fff4eb;
      color: #d9480f;
      font-weight: 800;
      border-radius: 999px;
      border: 1px solid #ffd8a8;
      font-size: 9.5px;
    }
    .footer {
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9.5px;
      color: #756561;
      border-top: 1px dashed #decbb8;
      padding-top: 8px;
    }
    .footer-sign {
      text-align: right;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">🍔 HANU HUNGRY</div>
      <div class="brand-sub">Hệ thống Khám phá Ẩm thực & Thống kê Check-in Sinh viên HANU</div>
    </div>
    <div class="meta-info">
      <div>Thời gian xuất: <strong>${formattedDate}</strong></div>
      <div>Phạm vi: <strong>Toàn bộ sinh viên (Không bao gồm Admin)</strong></div>
    </div>
  </div>

  <div class="doc-title-container">
    <h1 class="doc-title">BẢNG XẾP HẠNG CHUỖI CHECK-IN THÀNH VIÊN</h1>
    <p class="doc-subtitle">Tổng số: <strong>${students.length} sinh viên</strong> • Sắp xếp theo chuỗi hiện tại cao nhất giảm dần</p>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width: 42px;">STT</th>
        <th style="width: 28%;">Thành viên</th>
        <th class="center" style="width: 22%;">Mã sinh viên (MSSV)</th>
        <th style="width: 32%;">Email</th>
        <th class="center" style="width: 18%;">Chuỗi hiện tại</th>
      </tr>
    </thead>
    <tbody>
${tableRows}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <div>Dự án: Hanu Hungry • Website: hanuhungry.id.vn</div>
      <div>Báo cáo nội bộ dành cho Ban Quản trị hệ thống</div>
    </div>
    <div class="footer-sign">
      <div>Người lập báo cáo: <strong>Quản trị viên hệ thống</strong></div>
      <div style="margin-top: 25px; font-style: italic; color: #999;">(Đã ký duyệt điện tử)</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Mở cửa sổ in ấn A4 chuẩn cho phép In trực tiếp hoặc Lưu dưới dạng PDF (Save as PDF)
 */
export function exportToPdfPrint(students: ExportStudentItem[]): void {
  if (typeof window === "undefined") return;

  const html = generatePrintablePdfHtml(students);

  // Mở cửa sổ in ấn chuẩn
  const printWindow = window.open("", "_blank", "width=850,height=900,menubar=no,toolbar=no");
  if (!printWindow) {
    // Trình duyệt chặn popup -> dùng hidden iframe làm fallback
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 3000);
      }, 500);
    }
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  // Đợi tài liệu nạp xong rồi kích hoạt hộp thoại in / lưu PDF
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  // Fallback nếu sự kiện onload không kích hoạt trên một số trình duyệt
  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // Đã in xong hoặc cửa sổ đã đóng
    }
  }, 600);
}
