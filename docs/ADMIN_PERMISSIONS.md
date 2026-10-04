# Quyền ADMIN

HANU Hungry chỉ có hai role: `USER` và `ADMIN`. `ADMIN` dành cho quản lý **nội dung và báo cáo**. Tài khoản ADMIN không có quyền quản trị danh tính người dùng trong ứng dụng.

## Được phép

| Phạm vi | Hành động |
| --- | --- |
| Restaurants | Xem, thêm, sửa, cập nhật, deactivate hoặc xóa theo chính sách dữ liệu |
| Dishes | Xem, thêm, sửa, cập nhật, deactivate hoặc xóa |
| Categories | Quản lý phân loại và quan hệ quán–category |
| Blog | Viết, sửa, đăng, gỡ đăng hoặc xóa bài |
| Data content | Cập nhật nội dung quán, menu và dữ liệu liên quan |
| Analytics/reports | Xem thống kê tổng hợp từ dữ liệu thật |

Các thao tác nội dung quan trọng ghi vào `admin_audit_logs` với admin ID, hành động, entity, thời điểm và metadata không nhạy cảm.

## Không được phép

- Xóa, disable, ban hoặc impersonate user.
- Xem hoặc thay đổi mật khẩu user.
- Sửa email, MSSV hoặc role của user; tạo thêm admin trong dashboard.
- Gọi Supabase Auth Admin User Management từ browser hoặc bất kỳ dashboard route nào.
- Tự sửa hoặc xóa review/comment của user nếu chưa có yêu cầu moderation.
- Xem lịch sử riêng của từng user trong dashboard khi chỉ cần báo cáo tổng hợp.

Không xây `/admin/users` hay màn hình User Management. Project owner quản lý tài khoản bên ngoài admin dashboard. Bootstrap hai admin ban đầu là thao tác vận hành bằng service role, không phải capability của role ADMIN.

## Lớp thực thi

1. `app/admin/layout.tsx` dùng `requireAdmin()` để chặn truy cập dashboard ở server.
2. Mỗi action quản lý nội dung phải kiểm tra `requireAdmin()` trước khi ghi dữ liệu.
3. RLS dùng `public.is_admin()` từ `profiles.role` để chặn ghi trực tiếp vào Data API.
4. RLS của `profiles` không cho role ADMIN tùy ý quản lý hồ sơ user khác; quyền service role chỉ dành cho server vận hành tin cậy.
