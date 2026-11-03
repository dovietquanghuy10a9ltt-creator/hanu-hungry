import test from "node:test";
import assert from "node:assert/strict";
import {
  prepareStudentExportData,
  prepareAllStudentsExportData,
  generateExcelXml,
  generateAllStudentsExcelXml,
  generateCsvContent,
  generatePrintablePdfHtml,
  generateAllStudentsPdfHtml,
} from "../features/admin/components/analytics/exportUtils.ts";

const mockAccounts = [
  {
    id: "admin-1",
    student_code: "2404060034",
    display_name: "mtvzzn",
    avatar_url: null,
    role: "ADMIN",
    email: "mtvzzn@gmail.com",
    created_at: "2026-09-01T00:00:00Z",
    last_sign_in_at: "2026-11-03T10:00:00Z",
  },
  {
    id: "admin-2",
    student_code: "2404060015",
    display_name: "huyennhung1213",
    avatar_url: null,
    role: "ADMIN",
    email: "huyennhung@gmail.com",
    created_at: "2026-09-01T00:00:00Z",
    last_sign_in_at: "2026-11-03T10:00:00Z",
  },
  {
    id: "user-1",
    student_code: "2507210058",
    display_name: "thungan0699",
    avatar_url: null,
    role: "USER",
    email: "thungan0699@gmail.com",
    created_at: "2026-10-01T00:00:00Z",
    last_sign_in_at: "2026-11-03T08:00:00Z",
  },
  {
    id: "user-2",
    student_code: "2607240117",
    display_name: "tuongwfvhy14",
    avatar_url: null,
    role: "USER",
    email: "tuongwfvhy14@gmail.com",
    created_at: "2026-10-02T00:00:00Z",
    last_sign_in_at: "2026-11-03T07:30:00Z",
  },
  {
    id: "user-3",
    student_code: "2607010005",
    display_name: "haan280908",
    avatar_url: null,
    role: "USER",
    email: "haan280908@gmail.com",
    created_at: "2026-10-03T00:00:00Z",
    last_sign_in_at: "2026-11-03T09:00:00Z", // Đăng nhập mới nhất trong các USER
  },
  {
    id: "user-4",
    student_code: "2407010143",
    display_name: "nguyenthaobui2504",
    avatar_url: null,
    role: "USER",
    email: "nguyenthaobui2504@gmail.com",
    created_at: "2026-10-04T00:00:00Z",
    last_sign_in_at: null, // Chưa đăng nhập
  },
];

const mockStreakRanking = [
  {
    userId: "user-3",
    studentCode: "2607010005",
    displayName: "haan280908",
    avatarUrl: null,
    role: "USER",
    email: "haan280908@gmail.com",
    currentStreak: 12,
    longestStreak: 25,
    isTodayCheckedIn: true,
    totalCheckIns: 40,
    lastCheckInAt: "2026-11-03T06:00:00Z",
  },
  {
    userId: "user-1",
    studentCode: "2507210058",
    displayName: "thungan0699",
    avatarUrl: null,
    role: "USER",
    email: "thungan0699@gmail.com",
    currentStreak: 5,
    longestStreak: 14,
    isTodayCheckedIn: true,
    totalCheckIns: 20,
    lastCheckInAt: "2026-11-03T08:00:00Z",
  },
  {
    userId: "user-2",
    studentCode: "2607240117",
    displayName: "tuongwfvhy14",
    avatarUrl: null,
    role: "USER",
    email: "tuongwfvhy14@gmail.com",
    currentStreak: 5,
    longestStreak: 8,
    isTodayCheckedIn: false,
    totalCheckIns: 10,
    lastCheckInAt: "2026-11-02T08:00:00Z",
  },
];

test("prepareStudentExportData filters out ADMIN accounts and sorts by highest streak descending", () => {
  const result = prepareStudentExportData(mockAccounts, mockStreakRanking);

  // 1. Phải loại trừ 100% tài khoản Admin và loại bỏ những ai có chuỗi = 0 (chỉ giữ lại chuỗi >= 1)
  assert.equal(result.length, 3, "Chỉ giữ lại 3 tài khoản USER có currentStreak >= 1, loại bỏ ADMIN và chuỗi = 0");
  assert.ok(
    !result.some((r) => r.displayName === "mtvzzn" || r.displayName === "huyennhung1213"),
    "Không chứa bất kỳ Admin nào"
  );
  assert.ok(
    !result.some((r) => r.currentStreak === 0),
    "Không chứa tài khoản có chuỗi = 0"
  );

  // 2. Sắp xếp giảm dần theo chuỗi hiện tại tại thời điểm xuất file (currentStreak)
  assert.equal(result[0].displayName, "haan280908");
  assert.equal(result[0].currentStreak, 12);
  assert.equal(result[0].stt, 1);

  assert.equal(result[1].displayName, "thungan0699");
  assert.equal(result[1].currentStreak, 5);
  assert.equal(result[1].longestStreak, 14);
  assert.equal(result[1].stt, 2);

  assert.equal(result[2].displayName, "tuongwfvhy14");
  assert.equal(result[2].currentStreak, 5);
  assert.equal(result[2].longestStreak, 8);
  assert.equal(result[2].stt, 3);

  // 3. Đúng 3 trường thông tin yêu cầu + STT + streak
  assert.equal(result[0].studentCode, "2607010005");
  assert.equal(result[0].email, "haan280908@gmail.com");
});

test("prepareAllStudentsExportData filters out ADMIN, includes all students and sorts by last sign-in descending", () => {
  const result = prepareAllStudentsExportData(mockAccounts);

  // 1. Phải có 4 tài khoản USER, 2 tài khoản ADMIN phải bị loại bỏ
  assert.equal(result.length, 4, "Chỉ gồm 4 tài khoản USER, không có ADMIN");
  assert.ok(
    !result.some((r) => r.displayName === "mtvzzn" || r.displayName === "huyennhung1213"),
    "Không chứa Admin"
  );

  // 2. Thứ tự đăng nhập gần nhất:
  // user-3 (09:00) -> user-1 (08:00) -> user-2 (07:30) -> user-4 (null, ngày tạo)
  assert.equal(result[0].displayName, "haan280908");
  assert.equal(result[0].stt, 1);

  assert.equal(result[1].displayName, "thungan0699");
  assert.equal(result[1].stt, 2);

  assert.equal(result[2].displayName, "tuongwfvhy14");
  assert.equal(result[2].stt, 3);

  assert.equal(result[3].displayName, "nguyenthaobui2504");
  assert.equal(result[3].stt, 4);

  // 3. Không có thuộc tính streak
  assert.equal(result[0].currentStreak, undefined);
  assert.equal(result[0].studentCode, "2607010005");
  assert.equal(result[0].email, "haan280908@gmail.com");
});

test("generateExcelXml produces valid SpreadsheetML with Vietnamese characters and streak column", () => {
  const students = [
    {
      stt: 1,
      displayName: "Nguyễn Văn Đạt",
      studentCode: "2404060001",
      email: "dat.nguyen@gmail.com",
      longestStreak: 30,
      currentStreak: 15,
    },
  ];

  const xml = generateExcelXml(students);

  assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('ss:Name="Hanu_SinhVien_ChuoiNgay"'));
  assert.ok(xml.includes("Nguyễn Văn Đạt"));
  assert.ok(xml.includes("2404060001"));
  assert.ok(xml.includes("dat.nguyen@gmail.com"));
  assert.ok(xml.includes('<Data ss:Type="Number">15</Data>'));
  assert.ok(xml.includes("Chuỗi hiện tại (Ngày)"));
});

test("generateAllStudentsExcelXml produces valid 4-column SpreadsheetML without streak column", () => {
  const students = [
    {
      stt: 1,
      displayName: "Lê Thị Thu",
      studentCode: "2404060088",
      email: "thu.le@gmail.com",
    },
  ];

  const xml = generateAllStudentsExcelXml(students);

  assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('ss:Name="Hanu_ToanBo_SinhVien"'));
  assert.ok(xml.includes("Lê Thị Thu"));
  assert.ok(xml.includes("2404060088"));
  assert.ok(xml.includes("thu.le@gmail.com"));
  assert.ok(!xml.includes("Chuỗi hiện tại"));
});

test("generateCsvContent produces UTF-8 BOM CSV with proper quoting", () => {
  const students = [
    {
      stt: 1,
      displayName: 'Trần "Thanh" Mai',
      studentCode: "2404060002",
      email: "mai.tran@gmail.com",
      longestStreak: 18,
      currentStreak: 2,
    },
  ];

  const csv = generateCsvContent(students);

  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes("STT,Thành viên,Mã sinh viên (MSSV),Email,Chuỗi hiện tại (Ngày)"));
  assert.ok(csv.includes('"Trần ""Thanh"" Mai"'));
  assert.ok(csv.includes('"2404060002"'));
  assert.ok(csv.includes("2"));
});

test("generatePrintablePdfHtml produces clean HTML without redundant footers", () => {
  const students = [
    {
      stt: 1,
      displayName: "Vũ Hoàng Long",
      studentCode: "2404060003",
      email: "long.vu@gmail.com",
      longestStreak: 30,
      currentStreak: 7,
    },
  ];

  const html = generatePrintablePdfHtml(students);

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("HANU HUNGRY"));
  assert.ok(html.includes("BẢNG XẾP HẠNG CHUỖI CHECK-IN THÀNH VIÊN"));
  assert.ok(html.includes("Vũ Hoàng Long"));
  assert.ok(html.includes("2404060003"));
  assert.ok(html.includes("long.vu@gmail.com"));
  assert.ok(html.includes("🔥 7 ngày"));
  assert.ok(html.includes("Chuỗi hiện tại"));
  assert.ok(!html.includes("Phạm vi:"), "Không được chứa dòng Phạm vi");
  assert.ok(!html.includes("Đã ký duyệt điện tử"), "Không được chứa chữ ký điện tử");
  assert.ok(!html.includes("Người lập báo cáo:"), "Không được chứa người lập báo cáo");
  assert.ok(!html.includes("Dự án: Hanu Hungry"), "Không được chứa dòng chân trang dự án");
  assert.ok(!html.includes("Báo cáo nội bộ dành cho Ban Quản trị"), "Không được chứa ghi chú báo cáo nội bộ");
  assert.ok(html.includes("@page"));
});

test("generateAllStudentsPdfHtml produces clean 4-column HTML sorted by last visit without streak or footers", () => {
  const students = [
    {
      stt: 1,
      displayName: "Phạm Hải Đăng",
      studentCode: "2504060012",
      email: "dang.pham@gmail.com",
    },
  ];

  const html = generateAllStudentsPdfHtml(students);

  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("HANU HUNGRY"));
  assert.ok(html.includes("DANH SÁCH TÀI KHOẢN SINH VIÊN"));
  assert.ok(html.includes("Sắp xếp theo lượt truy cập gần nhất"));
  assert.ok(html.includes("Phạm Hải Đăng"));
  assert.ok(html.includes("2504060012"));
  assert.ok(html.includes("dang.pham@gmail.com"));
  assert.ok(!html.includes("Chuỗi hiện tại"), "Không có cột chuỗi");
  assert.ok(!html.includes("Đã ký duyệt điện tử"), "Không có footer ký tên");
  assert.ok(!html.includes("Dự án: Hanu Hungry"), "Không có footer dự án");
  assert.ok(html.includes("@page"));
});
