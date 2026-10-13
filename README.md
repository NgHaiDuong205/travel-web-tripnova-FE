# TripNova — Travel Booking Frontend

Web app for **TripNova**: book hotels, tours, car rentals and flights, plan a trip with AI on a satellite map, and manage everything from an admin and a hotel-manager dashboard.

- Backend (Spring Boot API): [travel-web-tripnova](https://github.com/NgHaiDuong205/travel-web-tripnova)
- [English](#english) · [Tiếng Việt](#tiếng-việt)

---

## English

### Tech stack

| | |
|---|---|
| UI | React 19 (Create React App), React Router 7 |
| Styling | Tailwind CSS 3 with light / dark palettes driven by CSS variables (`theme.palette.js`) |
| HTTP | Axios, with the Bearer token attached and one automatic token refresh on 401 (`src/config/axiosConfig.js`) |
| Maps | Leaflet + react-leaflet (Esri satellite / OpenStreetMap layers, OSRM road routes) |
| 3D | three.js + @react-three/fiber + drei (interactive globe on the home page) |
| Charts | Recharts (admin and hotel-manager statistics) |
| i18n | Custom lightweight i18n: English and Vietnamese, lazy-loaded dictionaries ([docs/I18N.md](docs/I18N.md)) |

### Features

**Travellers**
- Search and filter hotels, rooms, tours, cars and flights, with detail pages, photo galleries and reviews.
- Destinations and landmarks with weather, local time, nearby places and nearby hotels.
- Bookings with a 15-minute hold, a unified cart (one checkout per product type), payment, invoices (PDF) and cancellation.
- Flight seat map with several passengers; tours with fixed or flexible departure dates.
- **AI Planner**: builds a day-by-day itinerary from real places, shows it on a satellite map with real road routes, then books the hotel and car in one go.
- **AI assistant**: draggable chat bubble on every page, aware of the page you are viewing.
- Account area: profile, security, notifications, my trips, saved trips, itineraries, reviews, invoices.
- Sign in with email or Google / Facebook / GitHub. Shown in English or Vietnamese, light or dark theme. Works on mobile.

**Admin** (`/admin`): dashboard and statistics; manage hotels, rooms, room calendars, images, cars, flights and seats, tours, geography, amenities, users and roles, bookings, payments and refunds, invoices, reviews, contact messages, the AI knowledge base, chat logs, search queries and the audit log.

**Hotel manager** (`/manager`): statistics, hotels, room types, rooms, availability calendar and images for the hotels they manage.

### Project structure

```
src/
├── components/
│   ├── layouts/     Page shells: client, account dashboard, admin, manager, auth
│   ├── common/      Shared UI: form inputs, pagination, badges, lightbox, globe, theme / language switch
│   ├── client/      Header, footer, cart groups, reviews, destination sections…
│   ├── catalog/     Shared building blocks of the car / flight / tour pages
│   ├── admin/       Admin forms, room / calendar managers, statistics panel
│   ├── planner/     AI Planner: destination picker, trip map
│   ├── ai/          AI chat widget
│   └── home/        Home page globe and top destinations
├── pages/           One folder per screen: client/, auth/, admin/, manager/
├── routes/          AppRouter, client / admin / manager routes, PrivateRoute, hotel-account guard
├── services/        All API calls (one file per backend area) — components never call axios directly
├── context/         Auth, theme, hotel API (shared by admin and manager screens)
├── i18n/            i18n provider and dictionaries: locales/en, locales/vi
├── hooks/           Data hooks for the hotel and room lists
├── utils/           Formatting, currency, dates, geo, token storage, safe redirects…
├── constants/       Static data and API constants
└── config/          Axios instance
public/              index.html, icons, globe photos
scripts/             check-i18n.js
docs/                I18N.md (translation and dark-mode rules)
```

### Getting started

Requirements: Node.js 20+ and the [backend](https://github.com/NgHaiDuong205/travel-web-tripnova) running on `http://localhost:8080`.

```bash
git clone https://github.com/NgHaiDuong205/travel-web-tripnova-FE.git fe-tripnova
cd fe-tripnova
npm install
npm start          # http://localhost:3000
```

### Configuration

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `http://localhost:8080` (`.env.development`) | Backend URL. Leave empty to go through the dev proxy (`src/setupProxy.js`) on the same origin. |
| `REACT_APP_USD_VND_RATE` | `26000` | Exchange rate used to show prices in VND when the site is in Vietnamese. All prices are stored in USD. |

Put local overrides in `.env.local` (git-ignored). Variables are baked in at build time.

### Scripts

| Command | |
|---|---|
| `npm start` | Development server with hot reload |
| `npm run build` | Production build in `build/` |
| `npm run i18n:check` | Checks that English and Vietnamese have the same keys, that every key used in the code exists and that `{{placeholders}}` match |

### Deployment

`npm run build` produces static files. Serve them with any web server and send unknown paths to `index.html` (single-page app). The backend repository has a `docker-compose.yml` that builds this app and serves it with nginx together with the backend, the AI service and the database.

### Conventions

- Every visible text goes through `t("namespace.key")` with both English and Vietnamese entries. Run `npm run i18n:check` before committing. Data coming from the API is not translated.
- Use palette classes (`bg-surface`, `text-on-surface`, `bg-primary`…) instead of fixed colours, so dark mode keeps working.
- API calls live in `src/services`. Backend paths end with a trailing slash, lists use `page` (from 1) + `limit` and return the total in the `X-Total-Count` header.

---

## Tiếng Việt

### Công nghệ

| | |
|---|---|
| Giao diện | React 19 (Create React App), React Router 7 |
| Style | Tailwind CSS 3, bảng màu sáng / tối bằng biến CSS (`theme.palette.js`) |
| Gọi API | Axios: tự gắn Bearer token, tự làm mới token 1 lần khi gặp 401 (`src/config/axiosConfig.js`) |
| Bản đồ | Leaflet + react-leaflet (ảnh vệ tinh Esri / OpenStreetMap, đường đi OSRM) |
| 3D | three.js + @react-three/fiber + drei (quả địa cầu ở trang chủ) |
| Biểu đồ | Recharts (thống kê admin và quản lý khách sạn) |
| Đa ngôn ngữ | i18n tự viết, gọn nhẹ: tiếng Anh + tiếng Việt, từ điển tải lazy ([docs/I18N.md](docs/I18N.md)) |

### Chức năng

**Khách du lịch**
- Tìm kiếm, lọc khách sạn, phòng, tour, xe, chuyến bay; trang chi tiết có thư viện ảnh và đánh giá.
- Điểm đến và địa danh: thời tiết, giờ địa phương, địa điểm gần đó, khách sạn gần đó.
- Đặt chỗ giữ 15 phút, giỏ hàng chung (mỗi loại sản phẩm thanh toán riêng), thanh toán, hoá đơn PDF, huỷ đặt chỗ.
- Sơ đồ ghế máy bay cho nhiều hành khách; tour có ngày khởi hành cố định hoặc tự chọn.
- **AI Planner**: tạo lịch trình theo ngày từ địa điểm thật, hiển thị trên bản đồ vệ tinh kèm đường đi thật, rồi đặt khách sạn + xe một lần.
- **Trợ lý AI**: nút chat kéo thả được ở mọi trang, hiểu ngữ cảnh trang đang xem.
- Khu tài khoản: hồ sơ, bảo mật, thông báo, chuyến đi, mục đã lưu, lịch trình, đánh giá, hoá đơn.
- Đăng nhập bằng email hoặc Google / Facebook / GitHub. Giao diện tiếng Anh / tiếng Việt, sáng / tối, dùng tốt trên điện thoại.

**Quản trị** (`/admin`): tổng quan và thống kê; quản lý khách sạn, phòng, lịch phòng, ảnh, xe, chuyến bay và ghế, tour, địa lý, tiện ích, người dùng và vai trò, đặt chỗ, thanh toán và hoàn tiền, hoá đơn, đánh giá, tin nhắn liên hệ, tài liệu AI, hội thoại AI, truy vấn tìm kiếm, nhật ký hoạt động.

**Quản lý khách sạn** (`/manager`): thống kê, khách sạn, hạng phòng, phòng, lịch phòng trống và ảnh của các khách sạn mình phụ trách.

### Cấu trúc thư mục

```
src/
├── components/
│   ├── layouts/     Khung trang: khách, khu tài khoản, admin, quản lý khách sạn, đăng nhập
│   ├── common/      UI dùng chung: ô nhập, phân trang, nhãn trạng thái, xem ảnh, quả địa cầu, đổi giao diện / ngôn ngữ
│   ├── client/      Header, footer, giỏ hàng, đánh giá, các khối trang điểm đến…
│   ├── catalog/     Khối dựng chung cho trang xe / chuyến bay / tour
│   ├── admin/       Form admin, quản lý phòng / lịch, bảng thống kê
│   ├── planner/     AI Planner: chọn điểm đến, bản đồ chuyến đi
│   ├── ai/          Khung chat trợ lý AI
│   └── home/        Quả địa cầu và điểm đến nổi bật ở trang chủ
├── pages/           Mỗi màn hình một thư mục: client/, auth/, admin/, manager/
├── routes/          AppRouter, route khách / admin / manager, PrivateRoute, chặn tài khoản khách sạn
├── services/        Toàn bộ lời gọi API (mỗi nhóm backend một file) — component không gọi axios trực tiếp
├── context/         Đăng nhập, giao diện sáng/tối, API khách sạn (dùng chung admin và manager)
├── i18n/            Provider đa ngôn ngữ và từ điển: locales/en, locales/vi
├── hooks/           Hook tải danh sách khách sạn, phòng
├── utils/           Định dạng, tiền tệ, ngày giờ, toạ độ, lưu token, chuyển hướng an toàn…
├── constants/       Dữ liệu tĩnh và hằng số API
└── config/          Cấu hình axios
public/              index.html, icon, ảnh quả địa cầu
scripts/             check-i18n.js
docs/                I18N.md (quy tắc dịch và dark mode)
```

### Cài đặt và chạy

Cần Node.js 20+ và [backend](https://github.com/NgHaiDuong205/travel-web-tripnova) chạy ở `http://localhost:8080`.

```bash
git clone https://github.com/NgHaiDuong205/travel-web-tripnova-FE.git fe-tripnova
cd fe-tripnova
npm install
npm start          # http://localhost:3000
```

### Cấu hình

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `http://localhost:8080` (`.env.development`) | Địa chỉ backend. Để trống thì gọi qua proxy dev (`src/setupProxy.js`) cùng origin. |
| `REACT_APP_USD_VND_RATE` | `26000` | Tỷ giá để hiển thị giá bằng VND khi chọn tiếng Việt. Mọi giá lưu bằng USD. |

Ghi đè trên máy trong `.env.local` (bị gitignore). Biến được đóng gói lúc build.

### Lệnh

| Lệnh | |
|---|---|
| `npm start` | Chạy server dev, tự tải lại khi sửa code |
| `npm run build` | Build production vào `build/` |
| `npm run i18n:check` | Kiểm tra tiếng Anh và tiếng Việt cùng bộ khoá, mọi khoá dùng trong code đều tồn tại, biến `{{x}}` khớp nhau |

### Triển khai

`npm run build` tạo file tĩnh. Phục vụ bằng web server bất kỳ, đường dẫn lạ trả về `index.html` (ứng dụng một trang). Repo backend có `docker-compose.yml` build app này và phục vụ bằng nginx cùng backend, dịch vụ AI và cơ sở dữ liệu.

### Quy ước

- Mọi chữ hiển thị dùng `t("namespace.key")`, có đủ khoá tiếng Anh và tiếng Việt. Chạy `npm run i18n:check` trước khi commit. Dữ liệu lấy từ API thì không dịch.
- Dùng class theo bảng màu (`bg-surface`, `text-on-surface`, `bg-primary`…) thay vì màu cố định để dark mode không bị lỗi.
- Lời gọi API đặt trong `src/services`. Đường dẫn backend kết thúc bằng `/`, danh sách dùng `page` (từ 1) + `limit`, tổng số trả trong header `X-Total-Count`.
