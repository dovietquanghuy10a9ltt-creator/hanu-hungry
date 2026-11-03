import test from "node:test";
import assert from "node:assert/strict";
import {
  prepareStudentExportData,
  generateExcelXml,
  generateCsvContent,
  generatePrintablePdfHtml,
} from "../features/admin/components/analytics/exportUtils.ts";

test("prepareStudentExportData filters out ADMIN accounts and sorts by highest streak descending", () => {
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
      last_sign_in_at: "2026-11-03T08:00:00Z",
    },
    {
      id: "user-3",
      student_code: "2607010005",
      display_name: "haan280908",
      avatar_url: null,
      role: "USER",
      email: "haan280908@gmail.com",
      created_at: "2026-10-03T00:00:00Z",
      last_sign_in_at: "2026-11-03T06:00:00Z",
    },
    {
      id: "user-4",
      student_code: "2407010143",
      display_name: "nguyenthaobui2504",
      avatar_url: null,
      role: "USER",
      email: "nguyenthaobui2504@gmail.com",
      created_at: "2026-10-04T00:00:00Z",
      last_sign_in_at: "2026-11-03T05:00:00Z",
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
      longestStreak: 25, // Cao nhất: 25
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
      longestStreak: 14, // Thứ hai: 14
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
      longestStreak: 8, // Thứ ba: 8
      isTodayCheckedIn: false,
      totalCheckIns: 10,
      lastCheckInAt: "2026-11-02T08:00:00Z",
    },
    {
      userId: "admin-1",
      studentCode: "2404060034",
      displayName: "mtvzzn",
      avatarUrl: null,
      role: "ADMIN",
      email: "mtvzzn@gmail.com",
      currentStreak: 50,
      longestStreak: 100, // Admin có streak cao nhưng phải bị lọc bỏ
      isTodayCheckedIn: true,
      totalCheckIns: 120,
      lastCheckInAt: "2026-11-03T10:00:00Z",
    },
  ];

  const result = prepareStudentExportData(mockAccounts, mockStreakRanking);

  // 1. Phải loại trừ 100% tài khoản Admin
  assert.equal(result.length, 4, "Chỉ giữ lại 4 tài khoản USER, 2 tài khoản ADMIN phải bị loại bỏ");
  assert.ok(
    !result.some((r) => r.displayName === "mtvzzn" || r.displayName === "huyennhung1213"),
    "Không chứa bất kỳ Admin nào"
  );

  // 2. Sắp xếp giảm dần theo chuỗi hiện tại tại thời điểm xuất file (currentStreak)
  // user-3 (current: 12) -> user-1 (current: 5, longest: 14) -> user-2 (current: 5, longest: 8) -> user-4 (current: 0)
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

  assert.equal(result[3].displayName, "nguyenthaobui2504");
  assert.equal(result[3].currentStreak, 0); // Không có trong streakRanking -> default 0
  assert.equal(result[3].stt, 4);

  // 3. Đúng 3 trường thông tin yêu cầu + STT + streak
  assert.equal(result[0].studentCode, "2607010005");
  assert.equal(result[0].email, "haan280908@gmail.com");
});

test("generateExcelXml produces valid SpreadsheetML with Vietnamese characters and styles", () => {
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
  assert.ok(xml.includes('<Data ss:Type="Number">15</Data>')); // Chuỗi hiện tại 15
  assert.ok(xml.includes("Chuỗi hiện tại (Ngày)"));
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

  // Starts with UTF-8 BOM
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes("STT,Thành viên,Mã sinh viên (MSSV),Email,Chuỗi hiện tại (Ngày)"));
  assert.ok(csv.includes('"Trần ""Thanh"" Mai"'));
  assert.ok(csv.includes('"2404060002"'));
  assert.ok(csv.includes("2")); // Chuỗi hiện tại 2
});

test("generatePrintablePdfHtml produces structured HTML with A4 styling, Hanu branding and table rows", () => {
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
  assert.ok(html.includes("🔥 7 ngày")); // Chuỗi hiện tại 7
  assert.ok(html.includes("Chuỗi hiện tại"));
  assert.ok(html.includes("@page"));
});
