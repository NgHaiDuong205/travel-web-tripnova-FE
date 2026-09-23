# KIẾN TRÚC THƯ MỤC CHUẨN REACT SPA DOANH NGHIỆP

Dưới đây là sơ đồ kiến trúc dành riêng cho dự án TripNova để triển khai mở rộng 100+ trang.

```text
src/
 ├── 📁 assets/               # Chứa ảnh, fonts, file css dùng chung
 │
 ├── 📁 components/           # Nơi chứa các "Phụ tùng" tháo rời
 │    ├── 📁 common/          # Phụ tùng xài chung: Button, Input, Modal, Table
 │    ├── 📁 client/          # Phụ tùng mặt tiền: Header, Footer, HeroBanner...
 │    ├── 📁 admin/           # Phụ tùng quản trị: Sidebar, AdminTable...
 │    └── 📁 layouts/         # Bộ vỏ khung rỗng: ClientLayout.js, AdminLayout.js
 │
 ├── 📁 config/               # Cấu hình dự án (ví dụ: axiosConfig.js cấu hình Backend)
 │
 ├── 📁 constants/            # Túi lưới chứa Hằng số (như ENDPOINT, Mã Lỗi, Tên URL)
 │
 ├── 📁 context/              # Lưu trạng thái toàn trình (State) như Đăng nhập, Giỏ hàng
 │
 ├── 📁 hooks/                # Các móc câu móc dữ liệu tự viết (useFetch, useAuth)
 │
 ├── 📁 pages/                # Nơi ráp phụ tùng lại thành "Mâm cỗ" Màn hình (Pages)
 │    ├── 📁 client/          # Màn hình Khách (Home, Hotels, UserProfile)
 │    ├── 📁 admin/           # Màn hình Admin (Dashboard, UserManage, BookingManage)
 │    └── 📁 auth/            # Màn hình Chốt sổ (Login, Register, ForgotPassword)
 │
 ├── 📁 routes/               # Bảng công tắc Phân luồng
 │    ├── AppRouter.js        # Công tắc tổng
 │    ├── ClientRoutes.js     # Danh sách link Khách
 │    ├── AdminRoutes.js      # Danh sách link Quản trị
 │    └── PrivateRoute.js     # Chốt chặn vệ sĩ (Yêu cầu đăng nhập)
 │
 ├── 📁 services/             # Lớp Liên lạc (Gửi thư lên API Spring Boot)
 │    ├── authService.js      # Chứa hàm gửi API Login/Register
 │    └── ...                 # Nghĩa là file Giao diện TUYỆT ĐỐI không tự gọi Axios
 │
 └── 📁 utils/                # Lớp Tiện ích xử lý dữ liệu vụn vặt
      ├── formatters.js       # Dịch "10000" thành "10,000" hoặc định dạng ngày tháng
      └── validation.js       # Kiểm lỗi format định dạng Email / Số điện thoại
```

### 💡 Quy tắc Vàng:
1. File **App.js** chỉ được dùng để gọi `<AppRouter/>`. Cấm code thêm giao diện.
2. Tại các Màn hình trong `pages/`, **không được phép xử lý gọi API bằng Axios trực tiếp**. Phải gọi thông qua các hàm có sẵn ở thư mục `services/`.
3. Nếu có một đoạn code/component dùng lặp lại từ 2 lần trở lên, nó phải bị tách ra và ném vào thư mục `components/common/`.
