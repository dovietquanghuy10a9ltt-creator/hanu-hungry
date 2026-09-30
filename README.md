# HANU Hungry

HANU Hungry là ứng dụng Next.js và Supabase giúp sinh viên Đại học Hà Nội tìm quán, món ăn từ dữ liệu nhóm khảo sát; lưu lần đã ăn, viết đánh giá và đọc Blog. Giao diện bắt đầu từ điện thoại. Giá hoặc vị trí chưa có trong nguồn được để trống và hiển thị trạng thái đang cập nhật; ứng dụng không đoán tọa độ hay tính khoảng cách.

## Công nghệ và cấu trúc

- Next.js App Router, React, TypeScript và Tailwind CSS.
- Supabase Auth cho tài khoản và phiên; PostgreSQL cho dữ liệu, RLS cho quyền truy cập.
- Server Components cho trang đọc dữ liệu; Server Actions cho thao tác ghi; component client dùng cho form/tương tác.
- `app/` định nghĩa route, `features/` chứa logic theo tính năng, `components/` chứa phần giao diện dùng lại, `lib/` chứa auth/Supabase, `config/site.ts` tập trung thông tin thương hiệu.
- `supabase/migrations/` là nguồn schema/RLS/RPC; `scripts/import-food-data.ts` nhập CSV thật theo khóa nguồn ổn định.

Xem [kiến trúc](docs/ARCHITECTURE.md), [database](docs/DATABASE.md), [dữ liệu nhập](docs/DATA_IMPORT.md), [bảo mật](docs/SECURITY.md) và [quyền admin](docs/ADMIN_PERMISSIONS.md).

## Chạy local

Yêu cầu Node.js 24 (runtime đang dùng để chạy các script TypeScript trực tiếp) và một Supabase project. Project này đã được tạo sẵn; không cần scaffold Next.js mới.

```powershell
cd D:\hanu-hungry
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Mở `http://localhost:3000`. Điền các biến cần thiết trong `.env.local` trước khi chạy:

| Biến | Dùng cho |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase; được phép dùng trong browser. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key; được phép dùng trong browser, RLS vẫn kiểm soát dữ liệu. |
| `APP_URL` | Origin ứng dụng và redirect Auth, ví dụ `http://localhost:3000`; bắt buộc đặt đúng ở production. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chỉ server/runtime: bootstrap admin, import dữ liệu và đối chiếu email–MSSV khi khôi phục mật khẩu. Tuyệt đối không thêm `NEXT_PUBLIC_`. |
| `BOOTSTRAP_ADMIN_1_PASSWORD`, `BOOTSTRAP_ADMIN_2_PASSWORD` | Chỉ runtime khi tạo hai admin ban đầu; script không đổi mật khẩu của account đã có. |

Không commit `.env.local` hoặc in key/password ra log. Nếu dùng Supabase Auth qua email, cấu hình **Site URL** và redirect allow list cho `${APP_URL}/auth/callback` trong Supabase Dashboard. Luồng reset password cần email delivery được cấu hình tại Supabase.

## Schema và dữ liệu thật

Review trạng thái database trước mỗi thay đổi remote. Không dùng `db reset` với linked/production database.

```powershell
npx supabase db push --dry-run
# Sau khi review kế hoạch migration:
npx supabase db push
```

Nguồn CSV nằm mặc định trong `Downloads` của người chạy script. File gốc không bị sửa. Dry-run kiểm tra và báo chất lượng dữ liệu mà không kết nối database:

```powershell
npm run data:check
node --experimental-strip-types scripts/import-food-data.ts --apply
node --experimental-strip-types scripts/verify-database.ts --expect-seed
```

`--apply` cần `SUPABASE_SERVICE_ROLE_KEY` chỉ ở runtime. Có thể chỉ định file bằng `--data` và `--notes`, hoặc sinh `supabase/seed.sql` bằng `--sql-out`; chi tiết và số liệu audit có trong [DATA_IMPORT.md](docs/DATA_IMPORT.md). Importer upsert quán theo `source_stt`, món theo `source_key`, không tạo một quán cho mỗi dòng món và không biến giá thiếu thành 0.

Mốc kiểm chứng dữ liệu remote ngày 30/09/2026 sau seed: **59 quán, 950 món, 17 danh mục, 30 liên kết quán–danh mục**; RPC tìm kiếm không lọc trả 59 quán. Tính đến 01/10/2026, remote đã áp dụng **bốn migration**, gồm bản sửa trigger chỉ cho phép check-in với món đang hoạt động. Nguồn còn 9 quán thiếu địa chỉ, 29 quán chưa có danh mục và 4 giá chỉ có text, chưa chuẩn hóa được số. Đây là khoảng trống của dữ liệu khảo sát, không phải giá trị cần tự tạo cho đủ giao diện.

Database types đã được sinh từ schema Supabase đã áp dụng tại `lib/supabase/database.types.ts`. Sinh lại khi thay đổi migration:

```powershell
npx supabase gen types typescript --linked --schema public > lib/supabase/database.types.ts
```

Kiểm tra file sinh ra và các chỗ dùng Supabase client sau mỗi thay đổi schema.

## Tài khoản ban đầu

Người dùng đăng ký bằng MSSV đúng 10 chữ số, email và mật khẩu; đăng nhập bằng email và mật khẩu. Profile mặc định có `display_name` là phần trước `@` của email và role `USER`. Mật khẩu do Supabase Auth quản lý.

Hai admin được bootstrap ngoài giao diện, bằng key và password chỉ có ở runtime:

```powershell
npm run bootstrap:admins
```

Script có thể chạy lại mà không tạo account trùng. Admin chỉ quản lý quán, món, danh mục, Blog và báo cáo. Dashboard không quản trị user hoặc đổi role/password của người khác. Các quyền được giới hạn thêm bằng RLS trong migration.

## Routes

| Nhóm | Routes |
| --- | --- |
| Khám phá công khai | `/`, `/restaurants`, `/restaurants/[id]`, `/gacha`, `/blog`, `/blog/[slug]`, `/about`, `/contact` |
| Tài khoản | `/register`, `/login`, `/forgot-password`, `/reset-password`, `/auth/callback` |
| Cần đăng nhập | `/profile`, `/history`, `/notifications`, `/settings/password` |
| Admin | `/admin` và các trang con nằm sau server guard `requireAdmin()`; tác vụ ghi nội dung phải kiểm tra role và chịu RLS. |

Tìm kiếm dùng RPC `search_restaurants` để lọc tên quán, tên món, danh mục và giá số, có hỗ trợ dấu tiếng Việt. Gacha đọc quán/món từ database. Check-in chỉ được tạo khi người dùng bấm **Đã ăn**, không phải khi mở trang chi tiết; món được chọn phải đang hoạt động và thuộc đúng quán. Google Maps chỉ mở tọa độ thật hoặc address/Plus Code có trong nguồn.

Khu vực admin hiện có `/admin/restaurants`, `/admin/dishes`, `/admin/categories`, `/admin/blog` và `/admin/analytics`; các trang tạo/sửa nằm dưới từng nhóm tương ứng. Blog công khai đọc bài đã published; chỉ admin được tạo hoặc publish bài.

Ba bài hướng dẫn SEO gốc đã được publish trên remote cùng notification toàn cục. Script idempotent dưới đây dùng để tái tạo nội dung trên môi trường khác; chỉ chạy khi đã kiểm tra môi trường đích:

```powershell
npm run content:seed -- --apply
```

Script yêu cầu `BOOTSTRAP_ADMIN_1_PASSWORD` tại runtime, đăng nhập bằng session ADMIN và bỏ qua slug đã có. Chạy `npm run content:seed` không có `--apply` chỉ in hướng dẫn, không ghi dữ liệu.

## Kiểm tra

```powershell
npm test
npm run lint
npm run build
npm run db:verify
npm run db:verify -- --expect-seed
```

`npm test` gom các test auth, CSV và domain; có thể chạy riêng bằng `npm run test:auth`, `npm run test:data`, `npm run test:domain`. `db:verify` chỉ đọc bằng publishable key: quyền anon, RPC tìm kiếm và số liệu import khi dùng `--expect-seed`. Nếu cung cấp tạm `HANU_VERIFY_USER_ACCESS_TOKEN` và `HANU_VERIFY_ADMIN_ACCESS_TOKEN` trong environment, script còn kiểm tra quyền đọc của hai session; không ghi token vào file hoặc log.

`npm run test:security -- --remote` là smoke test RLS có ghi: nó tạo một USER tạm trên remote, thử quyền và xóa account trong `finally`. Chỉ chạy trên môi trường đã được chấp thuận, với `SUPABASE_SERVICE_ROLE_KEY`, `BOOTSTRAP_ADMIN_1_PASSWORD`, ít nhất một quán active và ba notification Blog. Lệnh `npm run test:security` thiếu `--remote` từ chối chạy. Checklist negative test và SQL/RLS ở [SECURITY.md](docs/SECURITY.md).

QA giao diện cần kiểm tra thực tế tại 320, 360, 375, 390, 412, 430, 768, 1024 và 1440 px; không có tràn ngang bất thường, nút dễ chạm và form dùng được với bàn phím mobile. `lint`, `build`, dữ liệu thật và RLS đều là cổng kiểm tra riêng; giao diện render được chưa đủ để coi deployment sẵn sàng.

## Chuẩn bị triển khai

1. Review và áp dụng migration an toàn, nhập CSV rồi xác nhận bằng `verify-database.ts --expect-seed`.
2. Sinh lại Supabase TypeScript types, chạy test, lint, build và QA responsive.
3. Đặt các biến môi trường đúng scope trong Vercel; service-role key và password admin chỉ ở server/runtime.
4. Cập nhật `APP_URL`, Supabase Auth Site URL và callback allow list theo domain production.
5. Kiểm tra đăng ký, xác nhận email, reset password, quyền USER/ADMIN và notification sau khi publish Blog trên môi trường đích.

Không thực hiện remote reset hay deploy production chỉ vì local build thành công.
