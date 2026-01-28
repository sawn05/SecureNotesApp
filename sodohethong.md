graph TD
    %% Định nghĩa các node và subgraph
    User(("Người dùng (User)"))
    
    subgraph Client_Side ["Client Side (Trình duyệt)"]
        Browser["Giao diện Web / JavaScript"]
    end

    subgraph Server_Side ["ASP.NET Core MVC Web Server"]
        Controller["NotesController"]
        Auth["Identity (Đăng nhập/Phân quyền)"]
        Security["SecurityHelper (AES-256)"]
        Cache["IMemoryCache (Caching)"]
    end

    subgraph Storage ["Lưu trữ dữ liệu"]
        DB[("SQL Server Database")]
        KeyStore["AppSettings / Key Vault"]
    end

    %% Luồng ghi dữ liệu (Lưu ghi chú - Mũi tên đi xuống)
    User -- 1. Nhập nội dung --> Browser
    Browser -- 2. HTTPS Post (Plain Text) --> Controller
    Controller -- 3. Check quyền --> Auth
    Controller -- 4. Lấy Key mã hóa --> KeyStore
    Controller -- 5. Gửi Plain Text --> Security
    Security -- 6. Trả về Cipher Text (Mã hóa) --> Controller
    Controller -- 7. Lưu Cipher Text --> DB

    %% Luồng đọc dữ liệu (Xem ghi chú - Mũi tên đi lên)
    %% Đã đổi sang mũi tên nét liền để tránh lỗi
    DB -- 8. Trả về Cipher Text --> Controller
    Controller -- 9. Gửi Cipher Text --> Security
    Security -- 10. Trả về Plain Text --> Controller
    Controller -- 11. Render HTML --> Browser
    Browser -- 12. Hiển thị nội dung --> User

    %% Style (Tô màu cho dễ nhìn)
    style Security fill:#f96,stroke:#333,stroke-width:2px,color:black
    style DB fill:#bbf,stroke:#333,stroke-width:2px,color:black
    style KeyStore fill:#ff9,stroke:#f66,stroke-width:2px,color:black