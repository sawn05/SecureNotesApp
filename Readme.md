# 🛡️ SecureNotesApp - Hệ Thống Quản Lý Cá Nhân Bảo Mật

**SecureNotesApp** là một ứng dụng Web được xây dựng trên nền tảng **ASP.NET Core MVC**, cung cấp giải pháp toàn diện để quản lý ghi chú, tài khoản mật khẩu, công việc (Tasks) và thư viện câu lệnh AI (Prompts). Hệ thống đặt ưu tiên cao về bảo mật với cơ chế phân quyền chặt chẽ và thuật toán mã hóa dữ liệu tiên tiến.

---

## ✨ Tính năng nổi bật (Key Features)

- **🔐 Xác thực & Phân quyền (Identity):** Quản lý đăng nhập, đăng ký sử dụng ASP.NET Core Identity.
  - Phân quyền Role-based (Admin / User) chặt chẽ.
- **📝 Quản lý Ghi chú (Notes):** Tạo, sửa, xóa và lưu trữ các ghi chú cá nhân một cách an toàn.
- **🔑 Quản lý Tài khoản (Saved Accounts):** Lưu trữ thông tin tài khoản các nền tảng (Facebook, Gmail...).
  - **Bảo mật cao:** Sử dụng thuật toán mã hóa đối xứng **AES-256** để mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu.
- **✅ Quản lý Công việc (Todo Tasks):** Theo dõi tiến độ công việc, thiết lập hạn chót (DueDate) và trạng thái hoàn thành.
- **🤖 Thư viện AI Prompts:** Quản lý các mẫu câu lệnh AI theo danh mục.
  - Trải nghiệm mượt mà không cần tải lại trang (SPA-feel) nhờ tích hợp **AJAX, Fetch API** và **jQuery** cho các thao tác Tìm kiếm, Thêm, Sửa, Xóa.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Backend:** C# / ASP.NET Core MVC
- **Database:** SQL Server & Entity Framework Core (Code-First Migration)
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap, jQuery, AJAX/Fetch API
- **Security:** ASP.NET Identity, AES-256 Encryption, AntiForgery Token, Cookie/Session State Management.

---

## 🚀 Hướng dẫn cài đặt và chạy ứng dụng bằng Visual Studio Code (VS Code)

**1. Yêu cầu môi trường:**

- IDE: **Visual Studio Code** (Yêu cầu cài đặt extension **C#** hoặc **C# Dev Kit**).
- Framework: **.NET SDK**
- Hệ quản trị CSDL: **SQL Server** và SQL Server Management Studio (SSMS).

**2. Clone respository**

- Mở terminal **(Cltr + `)** và chạy lệnh
  ```bash
  git clone https://github.com/sawn05/SecureNotesApp
**3. Cấu hình chuỗi kết nối (Connection String)**
- Mở thư mục dự án (Folder chứa file `.csproj`) bằng VS Code.
- Mở file `appsettings.json`.
- Tìm đến thuộc tính `"DefaultConnection"` và thay đổi `Server=.` thành tên SQL Server thực tế trên máy của bạn (Ví dụ: `Server=.\SQLEXPRESS` hoặc `Server=localhost`).

**4. Khởi tạo Cơ sở dữ liệu (Database Migration)**
- Mở Terminal tích hợp trong VS Code (Phím tắt: `` Ctrl + ` `` hoặc chọn menu **Terminal** > **New Terminal**).
- Gõ lệnh sau và nhấn Enter để hệ thống tự động tạo Database từ các file Migration có sẵn:
  ```bash
  dotnet ef database update
  ```
- Lưu ý: Nếu Terminal báo lỗi không nhận diện được lệnh dotnet ef, hãy chạy lệnh cài đặt tool này trước:
  ```bash
  dotnet tool install --global dotnet-ef
**5. Khởi chạy ứng dụng**
- Tại Terminal, gõ lệnh sau để khởi động Web Server:
  ```bash
  dotnet run
  ```
- Sau khi ứng dụng build thành công, Terminal sẽ hiển thị một đường dẫn (thường là `http://localhost:5xxx` hoặc `https://localhost:7xxx`).
- Giữ phím **Ctrl** và **Click** chuột trái vào đường dẫn đó để mở ứng dụng trên trình duyệt web.
