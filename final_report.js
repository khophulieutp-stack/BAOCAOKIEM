/* final_report.js – Cấu hình font/chữ/màu cho 14 cột */
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('reportData_Countable', (result) => {
        chrome.storage.local.remove('reportData_Countable');

        if (!result.reportData_Countable) {
            document.body.innerHTML = '<h1>Lỗi: Không tìm thấy dữ liệu báo cáo (DD).</h1>' +
                '<p>Vui lòng thử lại. Có thể dữ liệu đã bị đọc bởi một tab khác.</p>';
            return;
        }

        const { generalInfo, items } = result.reportData_Countable;

        const formatDate = (dateString) => {
            if (!dateString || dateString.split('-').length !== 3) return dateString;
            try {
                const parts = dateString.split('-');
                const d = new Date(parts[0], parts[1] - 1, parts[2]);
                return d.toLocaleDateString('vi-VN');
            } catch (e) {
                return dateString;
            }
        };

        // Điền thông tin chung
        document.getElementById('info-supplier').textContent = generalInfo.supplier || '';
        document.getElementById('info-po').textContent = generalInfo.po || '';
        document.getElementById('info-receive-date').textContent = formatDate(generalInfo.ngayNhap);
        document.getElementById('info-style').textContent = generalInfo.style || '';
        document.getElementById('info-date').textContent = formatDate(generalInfo.ngayKiem);
        const inspectorName = generalInfo.inspector || '';
        const infoInspector = document.getElementById('info-inspector');
        if (infoInspector) infoInspector.textContent = inspectorName;

        // Cấu hình font, size, màu cho 14 cột (chỉ cần chỉnh ở đây là cả bảng đổi)
        const columnStyles = [
            { fontFamily: 'Arial', fontSize: '10px', color: '#000000' },        // Item
            { fontFamily: 'Times New Roman', fontSize: '12px', color: '#000000' }, // Unit
            { fontFamily: 'Times New Roman', fontSize: '12px', color: '#000000' },  // P.list qty
            { fontFamily: 'Arial', fontSize: '12px', color: '#000000' },        // Act qty
            { fontFamily: 'Verdana', fontSize: '12px', color: '#000000' },      // Inspected qty
            { fontFamily: 'Tahoma', fontSize: '12px', color: '#000000' },       // Accepted AQL
            { fontFamily: 'Tahoma', fontSize: '12px', color: '#000000' },       // Rejected AQL
            { fontFamily: 'Arial', fontSize: '12px', color: '#000000' },        // Exceed
            { fontFamily: 'Arial', fontSize: '12px', color: '#000000' },        // Short
            { fontFamily: 'Courier New', fontSize: '9px', color: '#000000' },   // Metal Sample
            { fontFamily: 'Courier New', fontSize: '9px', color: '#000000' },   // Accepted Metal
            { fontFamily: 'Courier New', fontSize: '9px', color: '#000000' },   // Rejected Metal
            { fontFamily: 'Verdana', fontSize: '10px', color: '#000000' },      // Result Sample
            { fontFamily: 'Tahoma', fontSize: '10px', color: '#000000' }        // Remark
        ];

        // Điền bảng
        const tableBody = document.getElementById('report-table-body');
        tableBody.innerHTML = '';
        let overallFail = false;

        try {
            items.forEach(item => {
                const row = document.createElement('tr');
                const slThucNhan = (parseInt(item.slNhap, 10) || 0) + 
                                   (parseInt(item.qtyExceed, 10) || 0) - 
                                   (parseInt(item.qtyShort, 10) || 0);

                if (item.resultAql === 'FAIL' || item.resultSample === 'FAIL' || 
                    (item.resultMetal && item.resultMetal === 'FAIL')) {
                    overallFail = true;
                }

                row.innerHTML = `
                    <td>${item.loai}_${item.mau}_${item.tsSize}</td>
                    <td>${item.donVi || ''}</td>
                    <td>${item.slNhap || '0'}</td>
                    <td>${slThucNhan}</td>
                    <td>${item.aqlSampleSize || '0'}</td>
                    <td>${item.acceptedAql || '0'}</td>
                    <td>${item.defectAql || '0'}</td>
                    <td>${item.qtyExceed || '0'}</td>
                    <td>${item.qtyShort || '0'}</td>
                    <td>${item.metalSampleSize || ''}</td>
                    <td>${item.acceptedMetal || ''}</td>
                    <td>${item.defectMetal || ''}</td>
                    <td>${item.resultSample || ''}</td>
                    <td>${item.remark || ''}</td>
                `;

                // Áp dụng font/chữ/màu từ columnStyles
                row.querySelectorAll('td').forEach((td, index) => {
                    const style = columnStyles[index];
                    if (style) {
                        td.style.fontFamily = style.fontFamily;
                        td.style.fontSize = style.fontSize;
                        td.style.color = style.color;
                    }
                });

                tableBody.appendChild(row);
            });
        } catch (e) {
            tableBody.innerHTML = `<tr><td colspan="14">Lỗi nghiêm trọng khi vẽ bảng: ${e.message}</td></tr>`;
        }

        // Điền kết luận
        const passTextSpan = document.getElementById('conclusion-pass-text');
        const failTextSpan = document.getElementById('conclusion-fail-text');
        const handlingInstructionSpan = document.getElementById('handling-instruction');

        if (overallFail) {
            if (passTextSpan) passTextSpan.innerHTML = '&#9744; Đạt';
            if (failTextSpan) failTextSpan.innerHTML = '&#9745; <span style="color:red; font-weight:bold;">Không đạt</span>';
            if (handlingInstructionSpan) handlingInstructionSpan.textContent = 'PKD làm việc với NCC để xác nhận và xử lý lô hàng trên.';
        } else {
            if (passTextSpan) passTextSpan.innerHTML = '&#9745; <span style="color:green; font-weight:bold;">Đạt</span>';
            if (failTextSpan) failTextSpan.innerHTML = '&#9744; Không đạt';
            if (handlingInstructionSpan) handlingInstructionSpan.textContent = 'Đưa vào lưu trữ chờ sản xuất.';
        }

        // Hiển thị chữ ký / con dấu
        const inspectorWatermark = document.getElementById('inspector-watermark');
        const managerWatermark = document.getElementById('manager-watermark');

        if (inspectorName && inspectorWatermark) {
            const inspectorBoxStyle = `
               /* border: 2px solid #28a745;
                color:  */
                border-radius: 8px;
                padding: 5px 10px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 5px;
            `;
            inspectorWatermark.innerHTML = `<div style="${inspectorBoxStyle}">           </div>
                                            <p style="margin: 0; font-weight: bold;">${inspectorName}</p>`;
        }

        if (generalInfo.daDuyet === true && managerWatermark) {
            const managerName = generalInfo.nguoiDuyet || "QL Kho";
            const approveDate = generalInfo.ngayDuyet ? new Date(generalInfo.ngayDuyet).toLocaleDateString('vi-VN') : '';
            const managerBoxStyle = `
               /* border: 2px solid #007bff;
                color: #007bff;*/
                border-radius: 8px;
                padding: 5px 10px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 5px;
            `;
            managerWatermark.innerHTML = `<div style="${managerBoxStyle}">               </div>
                                          <p style="margin: 0; font-weight: bold;">${managerName}</p>
                                          <p style="margin: 0; font-size: 12px; font-weight: normal;">${approveDate}</p>`;
        }

    });
});
