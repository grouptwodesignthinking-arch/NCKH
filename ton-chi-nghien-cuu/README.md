# Ghi chú bộ quy tắc nghiên cứu

Ghi chú ngày 06/10/2026 sau khi đọc toàn bộ các tệp người dùng cung cấp.

> **Tôn chỉ làm việc chính:** [`tom-tat-day-du-toan-bo-bai-giang-phuong-phap-nghien-cuu.md`](tom-tat-day-du-toan-bo-bai-giang-phuong-phap-nghien-cuu.md). Người dùng yêu cầu mọi việc sau này phải tuân theo tôn chỉ này. Quy tắc vận hành rút gọn nằm trong [`../CLAUDE.md`](../CLAUDE.md), tệp mà Claude Code tự nạp vào mỗi phiên làm việc trong repo.
 Tệp này là bản đồ đọc nhanh và nhật ký đối chiếu. Nội dung quy tắc đầy đủ nằm trong các tệp gốc liệt kê bên dưới. Khi cần chi tiết hoặc căn cứ, mở tệp gốc thay vì dựa vào bản tóm tắt này.

## 1. Thành phần bộ tài liệu

| Tệp | Vai trò | Ghi chú kiểm tra |
|---|---|---|
| [`tom-tat-day-du-toan-bo-bai-giang-phuong-phap-nghien-cuu.md`](tom-tat-day-du-toan-bo-bai-giang-phuong-phap-nghien-cuu.md) | **Tôn chỉ chính.** Cẩm nang 28 mục và 3 phụ lục, hệ thống hóa 20 tệp nguồn (UEH Chương 1–7: 183 trang PDF và 48 slide; Saunders Lectures 1–11, 13, 14: 213 slide), phản hồi của giảng viên cho bài COB và quy tắc Scientific Writing của UNC. | Lưu nguyên văn, đã đọc toàn bộ 2.571 dòng. SHA-256 `0966005f…98ff4310`. Các tệp nguồn gốc của cẩm nang không có trong repo nên chưa kiểm tra trực tiếp được. |
| [`ton-chi-phuong-phap-nghien-cuu.md`](ton-chi-phuong-phap-nghien-cuu.md) | **Bản điều phối.** Danh mục nguồn, vai trò từng nguồn, 23 nguyên tắc vận dụng và bảng tra chương Saunders/Ormrod. | Lưu nguyên văn. Có tham chiếu tới một số tệp chưa có trong repo (mục 6). |
| [`ton-chi-quy-tac-nghien-cuu-chi-tiet.md`](ton-chi-quy-tac-nghien-cuu-chi-tiet.md) | **Bộ quy tắc vận hành.** 20 tôn chỉ, chuỗi logic, quy tắc theo chủ đề, 35 hard stop/red flag và các checklist. | Lưu nguyên văn. Là bản chuyển thể từ tệp Word. |
| [`ton-chi-bo-slide-saunders-9-lecture.md`](ton-chi-bo-slide-saunders-9-lecture.md) | **Bản đồ xác nhận.** Cho biết nội dung nào đã được đối chiếu trực tiếp với 9 bộ slide Saunders (Lectures 1, 2, 3, 4, 6, 9, 10, 13, 14). | Lưu nguyên văn. Chín tệp PowerPoint gốc không có trong đợt tải lên này nên chưa thể kiểm tra lại hash. |
| [`quy-tac-short-note.md`](quy-tac-short-note.md) | **Quy tắc tìm kiếm và sàng lọc tài liệu**, rút từ "A short note". | Tạo mới trong đợt này từ tệp pptx. |
| `research-methods-sources/Bo-Ton-Chi-Quy-Tac-Nghien-Cuu-Chi-Tiet.docx` | Bản Word gốc của bộ tôn chỉ chi tiết. | SHA-256 `7e49167d…bbb9c`, khớp hash ghi trong tệp md. Xác nhận 595 đoạn, 33 bảng, không có comment hay tracked change. |
| `research-methods-sources/A-short-note.pptx` | Bản gốc "Research Methodology – A short note" (9 slide). | SHA-256 `dd1f4e81…ddd956a5`. Đã đọc chữ và kiểm tra bản render của cả 9 slide. |

## 2. Thứ tự ưu tiên khi có xung đột

1. Yêu cầu hiện tại của người dùng và giảng viên.
2. Syllabus/rubric đang áp dụng (UEH MAN502123).
3. Tôn chỉ chính (cẩm nang), gồm các điểm hiệu chỉnh ở mục 25 của cẩm nang.
4. Giáo trình gốc: Saunders, Lewis & Thornhill (2023, ấn bản 9); Ormrod (2023, ấn bản 13 Global).
5. Các tệp bổ trợ và checklist trong bộ tôn chỉ. Checklist là công cụ kiểm tra, không thay lập luận phương pháp.

Ví dụ, bài tập, con số và lời dặn sinh viên trong nguồn **không** tự động thành yêu cầu cho mọi bài.

## 3. Nguyên tắc tối cao

> **Methodological coherence từ câu hỏi nghiên cứu đến kết luận.** Nếu một lựa chọn nghe "học thuật" nhưng không khớp RQ, philosophy, sampling hoặc analysis thì sửa lựa chọn đó, không sửa wording để che. Design sai thì sửa design; claim vượt dữ liệu thì thu hẹp claim.

Truy vết bắt buộc: `RQ → dữ liệu cần có → thu thập → phân tích → evidence → conclusion`, và trong phân tích định tính: `raw data → code → theme → claim`.

## 4. Hai mươi tôn chỉ (rút gọn mỗi ý một dòng)

1. Bắt đầu từ problem/RQ/aim/objectives, không bắt đầu từ công cụ (SEM, NVivo, interview, survey).
2. Mọi thành phần, từ philosophy đến reporting, phải cùng một logic.
3. Design là hệ thống quyết định. Mỗi nhãn phải có procedure thực tế đi kèm.
4. Strategy (case study, ethnography, GT, narrative inquiry, action research) khác method (interview, observation, diary, questionnaire).
5. Định tính không phải định lượng thu nhỏ. Không áp representativeness, công thức cỡ mẫu, IV/DV hay statistical generalisation.
6. Literature review phải critical và synthetic, tổ chức theo concept/theme/debate, không tóm tắt từng bài.
7. Philosophy phải để lại hậu quả nhìn thấy được trong data, researcher role và interpretation.
8. Nhãn deduction/induction/abduction/retroduction phải đúng với quy trình thật.
9. Sampling phục vụ mục đích phân tích. Gọi đúng probability/non-probability và subtype.
10. Phải chứng minh sample adequacy, không chỉ tuyên bố. Norm không phải luật.
11. Interview phải giảm researcher contamination: câu mở, probe, follow-up; audit leading/presupposition/evaluation.
12. Collection và analysis định tính có tương tác. Memo, summary và diary là bằng chứng của quá trình.
13. Code khác theme. Theme có essence, boundary và quan hệ với RQ.
14. Tần suất không quyết định mức quan trọng.
15. NVivo/CAQDAS chỉ hỗ trợ. Researcher phát triển theme và diễn giải.
16. Chỉ gọi Grounded Theory khi có collection–analysis đồng thời, constant comparison, memoing, theoretical sampling/saturation và theory development.
17. Ethics xuyên suốt cả vòng đời nghiên cứu.
18. Quality criteria phải khớp paradigm (credibility, dependability, transferability, reflexivity cho định tính).
19. Finding truy về data; conclusion trả lời RQ trong giới hạn evidence.
20. Không dùng wording để che lỗi phương pháp.

## 5. Ghi chú theo chủ đề (điểm dễ quên)

**Problem/RQ (L2).** Viết một overarching RQ không chứa tên method. Aim trả lời trực tiếp RQ. Objectives đạt sáu tiêu chuẩn: transparent, specific, relevant, interconnected, answerable, measurable/recognisable. Chọn mức theory grand / middle-range / substantive.

**Literature review và tìm kiếm (L3 + short note).**
- Ghi lại parameters, terms, databases, cú pháp toán tử, ngày tìm và tiêu chí chọn.
- Snowball backward/forward.
- Systematic review phải báo cáo đủ luồng: records theo nguồn → duplicates → screening → full-text → exclusions → included.
- Đọc phê bình bằng năm câu hỏi và bốn critique: rhetoric, tradition, authority, objectivity.
- Q1/IF/citation chỉ dùng để ưu tiên thứ tự đọc. "Chưa tìm thấy" không có nghĩa là "không tồn tại".
- Truy cập tài liệu qua kênh hợp pháp, không dùng Sci-Hub/LibGen.

**Philosophy (L4).** Năm philosophy: positivism, critical realism, interpretivism, postmodernism, pragmatism. Những ngộ nhận cần tránh: interview ≠ interpretivism, TA ≠ induction, có framework sẵn ≠ deduction, pragmatism ≠ giấy phép trộn phương pháp tùy ý.

**Design (L5, chưa đối chiếu slide).** Purpose: exploratory, descriptive, explanatory hoặc evaluative. Mixed methods phải có integration. Case study cần nêu single/multiple và holistic/embedded. Bản Word nêu GT dùng **abductive approach**.

**Ethics (L6).** Consent là một phổ (thiếu consent → inferred → informed); im lặng không phải informed consent. Consent phải bao phủ recording, data use, retention và secondary use. Bảy nguyên tắc xử lý dữ liệu cá nhân. Đối chiếu luật và ethics approval tại địa điểm nghiên cứu.

**Sampling (L7, chưa đối chiếu slide).** Population → target population → sample → case. Có chín subtype purposive. Bản Word ghi norm phỏng vấn định tính tham khảo khoảng **15–60**, khoảng **30** cho một tổ chức/nhóm và khoảng **50** cho nhiều tổ chức/nhóm. Đây chỉ là tham khảo, không phải công thức (bản md cố ý không ghi các con số này).

**Secondary data (L8, chưa đối chiếu slide).** Đánh giá qua ba cổng: phù hợp RQ/đo lường/bao phủ → phù hợp cho phân tích → chi phí/lợi ích/đạo đức.

**Observation (L9).** Mô tả bảy chiều: structure, formality, participation, position, identity, purpose disclosure, setting. Progressive focus: descriptive → focused → selective. Tách quan sát khỏi diễn giải. Kiểm tra observer error, drift, bias và effect.

**Interview và diary (L10).**
- Phân loại theo structure × medium × mode.
- Audit bốn nguồn dẫn dắt: introduced content, presupposition of situation, presupposition of relationship/cause, evaluation.
- Thang "language cleanness": classically clean → clean repeat → contextually clean → mildly/strongly leading.
- Mỗi câu một focus. Đi từ trải nghiệm cụ thể lên khái quát.
- Focus group phải xử lý group dynamics và giới hạn confidentiality.

**Survey (L11, chưa đối chiếu slide).** Phân biệt DV, IV, mediator, moderator và control. Audit thang đo có sẵn (8 câu hỏi). Pilot phải có lý do. Các loại validity/reliability áp dụng theo thiết kế.

**Phân tích định tính (L13).**
- Chọn technique dựa trên philosophy, theory logic và analytic logic của technique.
- Transcript phải được kiểm tra, kể cả khi dùng công cụ tự động.
- TA gồm sáu giai đoạn. Template Analysis có template được sửa lặp.
- Deductive explanation building: proposition → case → so sánh → sửa → case tiếp theo.
- Analytic induction và pattern matching chưa có procedure trong slide, **không tự suy diễn**.
- Không viết "NVivo generated the themes".

**Reporting (L14).** Dùng results–conclusions matrix. Quote phải phục vụ phân tích (snippet, table, sandwich, open sandwich, interactional sequence). Discussion không đưa finding mới. Conclusion không overclaim.

## 6. Quy tắc riêng cho cách mình hỗ trợ người dùng

- **Quy định AI của học phần (đã bỏ ngày 06/10/2026 theo xác nhận của người dùng; xem `CLAUDE.md`, quy tắc 10).** Syllabus cũ ghi dự án cuối kỳ "KHÔNG ĐƯỢC dùng AI để tạo bất kỳ nội dung, bảng biểu, số liệu nào". Với dự án chịu quy định này, mình giải thích phương pháp, hướng dẫn tự làm và phản biện bản người dùng viết. Mình không viết sẵn nội dung để nộp và không hỗ trợ né công cụ phát hiện AI/Turnitin. Quy định này không mở rộng thành lệnh cấm cho các việc khác.
- **Trung thực.** Không bịa dữ liệu, người tham gia, trích dẫn hay số trang. Không nói đã đọc nguồn khi chưa đọc. Số trang phải kiểm tra trên nguồn: Saunders có trang PDF = trang in + 27, Ormrod có trang PDF = trang in + 1 (chỉ đúng ở các phần đã kiểm tra).
- **Bài COB.** Mọi thuật ngữ và nhận định phải có nguồn. Văn phong thận trọng, không vòng vo kiểu AI. Trước khi thiết kế phỏng vấn, nêu rõ literature chưa trả lời điều gì và vì sao chọn nhóm người đó. Lập literature matrix và chọn khoảng hai anchor paper.
- **Chưa đủ căn cứ thì mở giáo trình.** Nếu slide chỉ nêu tên quy trình mà không có procedure, không suy diễn.

## 7. Phát hiện khi đối chiếu bản Word với bản md

Các mục dưới đây không phải lỗi nghiêm trọng, nhưng cần nhớ khi dùng bản md thay bản Word:

1. **Phạm vi của bản Word.** Hộp "Phạm vi tài liệu" ghi tài liệu là độc lập, "không áp dụng, bình luận hay sửa bất kỳ bài nghiên cứu hiện tại nào". Bản md chuyển nó thành quy tắc vận hành áp dụng cho công việc. Hiểu là: bản Word là chuẩn tham chiếu, còn việc áp vào bài cụ thể vẫn theo thứ tự ưu tiên ở mục 2.
2. **Số red flag.** Bản Word có đúng **40** red flag (mục XIX). Bản md gộp còn **35**, chủ yếu bằng cách nhập các cặp gần nhau (NVivo/method với "NVivo generated themes"; themes giống câu hỏi với demographic buckets; quote không diễn giải với quote cắt ngữ cảnh; causal assumptions với loaded wording; reflexivity generic với bỏ qua researcher role). Không mất nội dung thực chất.
3. **Chi tiết bản Word có nhưng bản md lược bỏ:**
   - con số norm cỡ mẫu (mục 5);
   - "abductive approach" là điều kiện của GT;
   - các loại câu hỏi đóng (list, category, ranking, rating, quantity, matrix, scale);
   - danh sách validity của L11 (internal, external, ecological, content, criterion, construct, convergent, discriminant);
   - bảng xử lý "participant hỏi ngược interviewer";
   - ví dụ câu hỏi tốt/xấu ("Việc X khiến bạn mất động lực như thế nào?" là leading nếu participant chưa xác nhận);
   - bảng quan hệ định tính–định lượng (L5);
   - quy trình ra quyết định nhanh 12 bước (mục XXI).
   Khi cần các chi tiết này, mở bản Word.
4. **Đánh số danh sách trong bản Word bị lệch.** Ba cổng secondary data đánh số 6–8 và quy trình quyết định nhanh đánh số 9–20 do danh sách nối tiếp. Đây chỉ là lỗi định dạng.
5. **Số trang.** Bản md ghi 26 trang. Khi render bằng LibreOffice ra 27 trang, nhiều khả năng do khác font. Nội dung không đổi.
6. **Lectures 5, 7, 8, 11.** Bản md chi tiết ghi là chưa đối chiếu với slide gốc. Cẩm nang ghi đã rà soát cả bốn lecture này (21, 16, 7 và 28 slide, khớp số slide trong bản Word) và bổ sung chi tiết. Ví dụ: ba mức access (physical, cognitive, continuing); quy ước phân loại phản hồi (refusal, break-off dưới khoảng 50%, partial khoảng 50–80%, complete trên khoảng 80%); các cấu trúc mixed methods; tiêu chí authenticity. Khi cần phán đoán chi tiết, ưu tiên cẩm nang, rồi đến giáo trình.

## 8. Tệp được tham chiếu nhưng chưa có trong repo

Nội dung của bộ bài giảng UEH 7 chương, phản hồi của thầy cho bài COB và quy tắc văn phong khoa học hiện đã nằm trong cẩm nang (mục 2–8 và mục 28). Tuy vậy, bản điều phối vẫn liên kết tới các tệp riêng sau. Chúng chưa được cung cấp nên các liên kết này vẫn hỏng:

- `ton-chi-bai-giang-7-chuong.md` và `research-methods-sources/ueh-lecture-set/` (bộ bài giảng UEH 7 chương)
- `phan-hoi-cua-thay-cho-bai-COB.md` (phản hồi của giảng viên cho bài COB)
- `quy-tac-van-phong-khoa-hoc-than-trong.md` (quy tắc văn phong khoa học thận trọng)
- `research-methods-sources/Saunders-Lewis-Thornhill-2023-9e.pdf`
- `research-methods-sources/Ormrod-2023-Practical-Research-13e-Global.pdf`
- `research-methods-sources/Syllabus-UEH-MAN502123.docx`
- `research-methods-sources/saunders-lecture-set/` (9 bộ slide Saunders)

`quy-tac-short-note.md` đã được tạo trong đợt này.

## 9. Khác biệt đáng chú ý giữa cẩm nang và các tệp trước

- **Quy định AI của syllabus** chỉ có trong `ton-chi-phuong-phap-nghien-cuu.md`, cẩm nang không nhắc lại. Ngày 06/10/2026, người dùng xác nhận phiên bản sau không còn quy định này, nên nó không còn áp dụng (`CLAUDE.md`, quy tắc 10).
- **Cách phân loại interview mode.** Cẩm nang dùng individual/group, còn bản md đối chiếu slide dùng one-to-one, one-to-many, two-to-many. Hai cách không mâu thuẫn; cách sau chi tiết hơn.
- **Mức chi tiết phiên âm.** Cẩm nang (§20.2) nói không cần ghi mọi pause hay ngữ điệu nếu RQ chỉ cần nội dung chủ đề. Tệp chi tiết nhấn mạnh không rút gọn transcript nếu làm mất bằng chứng liên quan. Hai ý nhất quán: mức phiên âm theo mục đích phân tích, và phải ghi rõ quy ước.
- **Ví dụ trong mục 28.5–28.6 của cẩm nang** dùng chính chủ đề COB (young early-career workers ở TP.HCM, social powerlessness, "lying flat"). Đây là ví dụ minh họa của nguồn, không phải RQ hay câu hỏi phỏng vấn đã được duyệt cho bài nộp.
