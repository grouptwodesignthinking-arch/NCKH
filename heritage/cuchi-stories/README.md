# Củ Chi Stories — Heritage Edition

Một bản app trải nghiệm bằng tiếng Việt, thiết kế mới hoàn toàn cho điện thoại và màn hình lớn. Cảm hứng: xanh olive, giấy trắng ngà nhám, bảng hiệu Việt, con dấu và sổ ký ức; logo Củ Chi riêng. Bộ chữ thống nhất theo chỉ định của người dùng: NVN Marseille Vintage cho tiêu đề, 1FTV VIP Longevity cho nội dung. Không phải sản phẩm chính thức hoặc liên kết với Cộng Cà Phê/di tích Củ Chi.

## Mở nhanh

**Trên điện thoại:** mở https://grouptwodesignthinking-arch.github.io/NCKH/ (GitHub Pages, HTTPS: camera, quét QR và AR bám mã đều dùng được). In hoặc mở trên màn hình khác trang mã QR [`docs/ma-tram-CC01-CC06.png`](../../docs/ma-tram-CC01-CC06.png) để thử.

**Trên máy:** mở file **Cu-Chi-Stories-Heritage.html** bằng trình duyệt. Font, ảnh, giao diện và nội dung đều nhúng sẵn. Các màn chính, nhiệm vụ, điểm số, hộ chiếu và ghi chú dùng được khi không có mạng. Chỉnh nội dung ở biểu tượng thanh trượt trên cùng hoặc liên kết Quản lý cuối trang.

Trong bản HTML, dữ liệu lưu trên trình duyệt/thiết bị hiện tại. Xuất nội dung JSON và tải hộ chiếu để giữ bản sao. Việc lưu dữ liệu với URL file có thể khác nhau giữa các trình duyệt. Mở HTML từ ứng dụng Files trên điện thoại có thể chỉ hiện bản xem trước; cần mở bằng trình duyệt hỗ trợ JavaScript.

## Chạy bản có backend cục bộ

Máy có Python 3.10 trở lên, mở thư mục này và chạy:

```sh
python3 server.py
```

Truy cập http://127.0.0.1:8765. Bàn biên tập: http://127.0.0.1:8765/#/admin.

Máy chủ tạo `data/content.sqlite3` từ `content.json` ở lần đầu. Lưu câu chuyện ở bàn biên tập thực sự cập nhật SQLite. Hộ chiếu và ghi chú vẫn là dữ liệu riêng trên trình duyệt. Máy chủ chỉ nghe tại loopback, có kiểm tra Host/Origin/token đối với ghi nội dung, giới hạn dữ liệu và đường dẫn phục vụ tệp. Đây chưa phải backend công khai có đăng nhập, phân quyền hoặc đồng bộ tài khoản. Không mở máy chủ này ra Internet khi chưa bổ sung những phần đó.

## Trải nghiệm đã có

- 3 hành trình, 6 chương câu chuyện, bộ lọc chủ đề và trạng thái đã nhận dấu.
- Sơ đồ trạm tương tác (minh họa, không định vị thực tế).
- **Bản đồ 3D địa đạo** (`#/explorer`): mô hình ba tầng (mặt đất, tầng 1 ~3 m, tầng 2 ~6 m, tầng 3 8–12 m) với đường hầm, giếng nối, gian bếp có rãnh dẫn khói lên mặt đất, đèn dầu nhấp nháy và một đốm sáng đi theo đường hành trình qua 6 trạm. Kéo để xoay, chụm/cuộn để phóng, chạm trạm (hoặc nhãn) để xem thông tin và mở chuyện/VR/AR; bật/tắt từng tầng và đường hành trình. **AR bản đồ:** bật camera và hướng vào bất kỳ mã CC-01 … CC-06, mô hình đặt lên mã và bám theo vị trí, góc xoay, độ nghiêng.
- **Cảnh VR** (`#/vr/<trạm>`, nút “Vào VR” ở trang chủ, trang chuyện, màn AR): cảnh 3D góc nhìn thứ nhất cho cả 6 trạm: rừng có nắp hầm mở/đóng được, ụ thông hơi, gian bếp Hoàng Cầm có lửa và đèn dầu, đường hầm đi tới/lùi lại được, hố bom, lối rừng cao su. Kéo để nhìn quanh, bật con quay của điện thoại để nhìn theo hướng máy, chế độ kính VR (chia đôi màn hình, toàn màn hình, xoay ngang). Mỗi cảnh có 3–4 điểm số chạm để đọc chú thích.
- **Vật thể 3D trong AR và khi quét:** màn AR hiện mô hình của trạm (xoay xem trước khi chưa bật camera; khi thấy đúng mã thì mô hình đứng trên mã và bám theo). Quét mã ở màn Quét thì vật thể của trạm bật lên trên mã khoảng 1,6 giây rồi mở chương.
- Đọc câu chuyện; giọng đọc tích hợp của thiết bị nếu được hỗ trợ.
- 6 câu hỏi, phản hồi đúng/sai, 50 điểm/trạm, không cộng trùng; dấu và cấp độ theo tiến trình.
- Hộ chiếu, ghi chú và tải bản văn bản.
- Xin quyền camera, hiển thị video trực tiếp, dừng camera khi rời màn hình.
- Quét QR bằng BarcodeDetector của trình duyệt, hoặc bằng bộ đọc jsQR đóng gói sẵn (chạy offline) trên trình duyệt không hỗ trợ như Safari iOS; mã CC-01 … CC-06, chấp nhận cả mã QR chứa đường dẫn có mã trạm (không tự mở URL); nhập tay luôn có sẵn (nhận cả “cc01”).
- Màn AR với hotspot tương tác trên ảnh hoặc camera. Khi bật camera và thấy đúng mã trạm của câu chuyện, các điểm chú thích bám theo vị trí, kích thước và góc xoay của mã in (marker 2D); mất mã thì trở về vị trí cố định. Trạng thái hiện rõ: đang tìm → đang bám → mất dấu → mã của trạm khác.
- So sánh lớp màu sepia / ảnh gốc: không giả là ảnh lịch sử trước–sau.
- Sơ đồ cấu trúc tương tác: không giả là mô hình 3D đúng tỷ lệ. Trình duyệt không có WebGL thì `#/explorer` quay về sơ đồ 2D này.
- Quản lý nội dung, câu hỏi, đáp án, điểm trạng thái triển khai AR; xuất JSON.

## Giới hạn và phần nối tiếp

Mô hình 3D và cảnh VR là **minh họa dựng bằng khối đơn giản** (three.js), không theo tỷ lệ, không phải bản quét 3D hay bản vẽ kỹ thuật của di tích, và không dùng để chỉ đường; app ghi rõ “Mô hình minh họa” trên các màn này. VR là cảnh 3D dựng sẵn, không phải ảnh/video 360° chụp tại di tích. AR là bám mã 2D trên màn hình (vật thể đặt theo 4 góc mã, nghiêng theo độ co của mã), chưa phải neo không gian thật. Không có nhận diện hiện vật, world tracking/WebXR, 3D reconstruction, định vị tuyến đường, tài khoản, phân quyền hoặc đồng bộ hộ chiếu giữa thiết bị. Đọc `CLAUDE-AR-HANDOFF.md` để nối tiếp phần AR mà không làm lại giao diện.

Camera cần quyền truy cập, thiết bị và ngữ cảnh an toàn do trình duyệt cho phép. Không bảo đảm camera/QR chạy từ mọi trình xem file HTML. Không dùng ảnh camera để tự động cộng điểm; app không gửi video lên máy chủ.

Câu chuyện hiện là nội dung diễn giải cho prototype, không phải thuyết minh được di tích phê duyệt. Cần thẩm định nội dung trước phát hành. Thời gian là ước tính đọc, không phải tổng thời gian tham quan.

## Tư liệu và giấy phép

Ảnh lấy từ bộ CuChi_100_Images.zip người dùng cung cấp. Tác giả, giấy phép và nguồn trong `assets/source-manifest.csv`; app cũng hiển thị phần Nguồn ảnh. Các ảnh trong app được đổi định dạng và giảm dung lượng phục vụ web. Giữ yêu cầu ghi công và chia sẻ tương tự tương ứng khi tái phân phối. Font do người dùng cung cấp, xem mục Bộ chữ. Bộ đọc QR jsQR 1.4.0 (Apache-2.0), giấy phép tại assets/LICENSE-jsQR.txt. Đồ họa 3D dùng three.js r149 (MIT, `assets/three.min.js`, giấy phép tại assets/LICENSE-three.txt); toàn bộ mô hình được dựng bằng mã trong `assets/cuchi3d.js`, không dùng mô hình hay texture bên ngoài.

Logo riêng tạo bằng công cụ imagegen tích hợp. Prompt lưu trong `LOGO-PROMPT.txt`; bản logo gốc `assets/logo.png`, bản dùng cho web `assets/logo.webp`. Không chỉnh sửa nội dung logo sau khi tạo; chỉ đổi định dạng lossless.

## Cấu trúc

- index.html / styles.css / app.js: frontend không cần cài thư viện.
- content.json: dữ liệu khởi tạo backend.
- server.py: máy chủ SQLite cục bộ.
- credits.js và assets/: hình, font, nguồn ảnh.
- assets/cuchi3d.js: bản đồ 3D, cảnh VR và vật thể AR (`window.CuChi3D`), chạy trên three.js nhúng sẵn, không cần mạng.
- build.py: đóng gói lại HTML độc lập bằng Python standard library.

Sau khi chỉnh mã, chạy `python3 build.py`, rồi chép `../Cu-Chi-Stories-Heritage.html` thành `docs/index.html` ở gốc repo để cập nhật trang GitHub Pages. Bản HTML đóng gói dùng nội dung mặc định trong app.js; các thay đổi trong SQLite cần được xuất từ bàn biên tập rồi chuyển lại thành DEFAULT_STORIES khi muốn làm bản phát hành mới. Không tự ghi đè nội dung đang biên tập.

## Bộ chữ và mẫu giấy — cập nhật theo chỉ dẫn mới

Toàn bộ app dùng hai font do người dùng cung cấp, nhúng trực tiếp:

- **NVN Marseille Vintage** (`assets/NVNMarseille-Vintage.ttf`, © 2017 Louise Fili, bản Việt hoá NVN) cho tiêu đề và tiêu đề phụ: biến CSS `--serif` và `--sub`.
- **1FTV VIP Longevity** (`assets/1FTV-VIP-Longevity.otf`, © 2023 Fikryal Studio) cho nội dung: biến `--sans`.

Cả hai đã được kiểm tra có đủ ký tự tiếng Việt, nên không còn font dự phòng cho dấu. Mỗi font chỉ có một độ đậm, nên `@font-face` khai báo phủ 100–900 và `font-synthesis:none` để trình duyệt không làm đậm hay nghiêng giả. Bộ font cũ (Moderniz, Impact/Anton, Garet, Archivo Black, Be Vietnam Pro, Playfair Display) đã được gỡ khỏi bộ mã.

**Cần xác nhận giấy phép sử dụng web/thương mại của hai font trước khi phát hành công khai**, vì tệp font không kèm giấy phép.

Nền giấy là asset gốc được tạo bằng imagegen tích hợp, không lấy từ nguồn bên ngoài. Xem TEXTURE-PROMPT.txt.
