# Hanu Hungry Mobile App (React Native & Expo)

Ứng dụng di động chính thức của **Hanu Hungry** dành cho sinh viên Trường Đại học Hà Nội (HANU), xây dựng bằng **React Native** & **Expo SDK 52** (Expo Router, TypeScript).

---

## 1. Tính Năng Nổi Bật Của Mobile App

- 🍔 **Khám phá ẩm thực**: Lưới quán ăn quanh cổng trường HANU, tìm kiếm nhanh không dấu, lọc theo khu vực (Triều Khúc, Phùng Khoang, Sân vận động...).
- 🎲 **Vòng quay Gacha ngẫu nhiên**: Chọn mức ngân sách (30k, 45k, 60k) $\rightarrow$ quay chọn món với **hiệu ứng rung xúc giác Haptic (`expo-haptics`)** chân thật trên điện thoại.
- 🔥 **Check-in 1 chạm & Giữ chuỗi (Streak)**: Tích lũy chuỗi ngày liên tiếp theo múi giờ Việt Nam (+07:00), theo dõi chuỗi hiện tại và chuỗi kỷ lục.
- 🗺️ **Chỉ đường Google Maps**: Mở ứng dụng Google Maps chỉ đường trực tiếp tới quán ăn.
- 👤 **Xác thực sinh viên HANU**: Đăng nhập & Đăng ký bảo mật với kiểm tra định dạng MSSV HANU (K20 - K26).
- 🔄 **Đồng bộ thời gian thực 2 chiều với Web**: Tái sử dụng 100% cơ sở dữ liệu Supabase PostgreSQL hiện có của dự án. Mọi check-in trên App đều hiển thị tức thì trên Web Admin Analytics.

---

## 2. Cấu Trúc Thư Mục `mobile/`

```
mobile/
├── app/                         # Expo Router (File-based navigation)
│   ├── _layout.tsx              # Root Stack Layout & Auth Provider
│   ├── (tabs)/                  # 4 Tabs chính ở thanh đáy
│   │   ├── _layout.tsx          # Tab Navigator (Khám phá, Gacha, Chuỗi, Tài khoản)
│   │   ├── index.tsx            # Màn hình 1: Khám phá quán ăn & Tìm kiếm
│   │   ├── gacha.tsx            # Màn hình 2: Vòng quay Gacha ngẫu nhiên + Haptics
│   │   ├── streak.tsx           # Màn hình 3: Thống kê chuỗi ngày & Lịch sử
│   │   └── profile.tsx          # Màn hình 4: Hồ sơ sinh viên, Đăng nhập/Đăng ký
│   └── restaurant/
│       └── [id].tsx             # Màn hình Chi tiết quán ăn & Thực đơn món
│
├── src/
│   ├── constants/theme.ts       # Bảng màu chuẩn Hanu Hungry (#B51B2C, #F8F4EE...)
│   ├── context/AuthContext.tsx  # Quản lý phiên đăng nhập Supabase Auth + SecureStore
│   ├── lib/supabase.ts          # Khởi tạo Supabase Client với Storage Adapter
│   ├── services/
│   │   ├── restaurants.ts       # APIs tải quán, món ăn, thực hiện check-in
│   │   └── streaks.ts           # Thuật toán tính chuỗi ngày chuẩn giờ Việt Nam
│   └── types/index.ts           # Kiểu dữ liệu TypeScript dùng chung
│
├── app.json                     # Cấu hình Expo (Bundle ID, Icons, Permissions)
├── package.json                 # Dependencies Expo SDK 52
└── tsconfig.json                # Cấu hình TypeScript
```

---

## 3. Hướng Dẫn Cài Đặt & Chạy Thử Trên Điện Thoại

### Bước 1: Cài đặt dependencies
Mở terminal tại thư mục `mobile`:
```bash
cd mobile
npm install
```

### Bước 2: Khởi động Expo Server
```bash
npx expo start
```

### Bước 3: Xem trực tiếp trên điện thoại
1. Tải ứng dụng **Expo Go** trên điện thoại:
   - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)
   - [Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Quét mã QR hiển thị trên màn hình terminal:
   - **iPhone**: Dùng ứng dụng Camera quét mã QR $\rightarrow$ bấm mở trong Expo Go.
   - **Android**: Mở ứng dụng Expo Go $\rightarrow$ chọn "Scan QR code".
3. Ứng dụng sẽ nạp mã nguồn và chạy trực tiếp trên điện thoại của bạn với đầy đủ tính năng rung xúc giác và kết nối trực tiếp vào cơ sở dữ liệu Supabase!

