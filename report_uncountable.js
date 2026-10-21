/*
 * report_uncountable.js (v6 - Cải tiến con dấu bo gốc)
 */
document.addEventListener('DOMContentLoaded', () => {

    chrome.storage.local.get('reportData_Uncountable', (result) => {

        chrome.storage.local.remove('reportData_Uncountable');

        if (!result.reportData_Uncountable) {
            document.body.innerHTML = '<h1>Lỗi: Không tìm thấy dữ liệu báo cáo (KDD).</h1>' +
            '<p>Vui lòng thử lại. Có thể dữ liệu đã bị đọc bởi một tab khác.</p>';
            return;
        }

        const { generalInfo, items } = result.reportData_Uncountable;

        // 1. Điền thông tin chung
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

        // Điền thông tin header (Giao diện mới)
        document.getElementById('info-supplier').textContent = generalInfo.supplier || '';
        document.getElementById('info-po').textContent = generalInfo.po || '';
        document.getElementById('info-receive-date').textContent = formatDate(generalInfo.ngayNhap);
        document.getElementById('info-style').textContent = generalInfo.style || '';
        // document.getElementById('info-order-qty').textContent = ''; // Sếp chưa có trường này
        document.getElementById('info-date').textContent = formatDate(generalInfo.ngayKiem);
        
        const inspectorName = generalInfo.inspector || '';
        const infoInspector = document.getElementById('info-inspector');
        if (infoInspector) infoInspector.textContent = inspectorName;


        // 2. Điền bảng
        const tableBody = document.getElementById('report-table-body');
        tableBody.innerHTML = '';
        let overallFail = false;

        try {
            items.forEach(item => {
                const row = document.createElement('tr');
                const slThucNhan = (parseInt(item.slNhap, 10) || 0) + (parseInt(item.qtyExceed, 10) || 0) - (parseInt(item.qtyShort, 10) || 0);

                if (item.resultAql === 'FAIL' || item.resultSample === 'FAIL') {
                    overallFail = true;
                }

                // Cập nhật đúng 11 cột theo giao diện mới
                row.innerHTML = `
                    <td>${item.loai} - ${item.mau} - ${item.tsSize}</i></td>
                    <td>${item.donVi || ''}</td>
                    <td>${item.slNhap || '0'}</td>
                    <td>${slThucNhan}</td>
                    <td>${item.aqlSampleSize || '0'}</td>
                    <td>${item.acceptedAql || '0'}</td>
                    <td>${item.defectAql || '0'}</td>
                    <td>${item.qtyExceed || '0'}</td>
                    <td>${item.qtyShort || '0'}</td>
                    <td>${item.resultSample || ''}</td>
                    <td>${item.remark || ''}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (e) {
            tableBody.innerHTML = `<tr><td colspan="11">Lỗi nghiêm trọng khi vẽ bảng: ${e.message}</td></tr>`;
        }

        // 3. ĐIỀN KẾT LUẬN
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
        
        // =================================================================
        // ✅ BƯỚC 4: HIỂN THỊ CHỮ KÝ (CON DẤU BO GỐC)
        // =================================================================
        const inspectorWatermark = document.getElementById('inspector-watermark');
        const managerWatermark = document.getElementById('manager-watermark');
        
        // 1. Watermark Người Kiểm (Con dấu "ĐÃ KIỂM TRA")
        if (inspectorName && inspectorWatermark) {
            const inspectorBoxStyle = `
               /* border: 2px solid #28a745; 
                color: #28a745; */
                border-radius: 8px; 
                padding: 5px 10px; 
                font-size: 16px; 
                font-weight: bold; 
                display: inline-block; 
                margin-bottom: 5px;
            `;
            inspectorWatermark.innerHTML = `
                <div style="${inspectorBoxStyle}">  .   </div>
                <p style="margin: 0; font-weight: bold;">${inspectorName}</p>
            `;
        }

        // 2. Watermark Quản Lý Kho (Con dấu "ĐÃ DUYỆT")
        if (generalInfo.daDuyet === true && managerWatermark) {
            const managerName = generalInfo.nguoiDuyet || "QL Kho";
            const approveDate = generalInfo.ngayDuyet ? new Date(generalInfo.ngayDuyet).toLocaleDateString('vi-VN') : '';
            
            const managerBoxStyle = `
               /* border: 2px solid #007bff; 
                color: #007bff; */
                border-radius: 8px; 
                padding: 5px 10px; 
                font-size: 16px; 
                font-weight: bold; 
                display: inline-block; 
                margin-bottom: 5px;
            `;
            
            managerWatermark.innerHTML = `
                <div style="${managerBoxStyle}">    .         </div>
                <p style="margin: 0; font-weight: bold;">${managerName}</p>
                <p style="margin: 0; font-size: 12px; font-weight: normal;">${approveDate}</p>
            `;
        }
        // =================================================================
        
    });
});