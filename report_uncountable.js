/* report_uncountable.js – Chạy song song cả trên Chrome Extension và Webapp GitHub Pages */
document.addEventListener('DOMContentLoaded', () => {

    function loadReportData(callback) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get('reportData_Uncountable', (result) => {
                if (result && result.reportData_Uncountable) {
                    chrome.storage.local.remove('reportData_Uncountable');
                    callback(result.reportData_Uncountable);
                    return;
                }
                readFromLocalStorage(callback);
            });
        } else {
            readFromLocalStorage(callback);
        }
    }

    function readFromLocalStorage(callback) {
        try {
            const raw = localStorage.getItem('reportData_Uncountable') || localStorage.getItem('viewReportData');
            if (raw) {
                callback(JSON.parse(raw));
            } else {
                callback(null);
            }
        } catch (e) {
            console.error(e);
            callback(null);
        }
    }

    loadReportData((reportData) => {
        if (!reportData) {
            document.body.innerHTML = '<h1>Lỗi: Không tìm thấy dữ liệu báo cáo (KDD).</h1>' +
                '<p>Vui lòng quay lại trang danh sách và bấm "Xem Chi Tiết" một lần nữa.</p>';
            return;
        }

        const { generalInfo, items } = reportData;

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

        document.getElementById('info-supplier').textContent = generalInfo.supplier || '';
        document.getElementById('info-po').textContent = generalInfo.po || '';
        document.getElementById('info-receive-date').textContent = formatDate(generalInfo.ngayNhap);
        document.getElementById('info-style').textContent = generalInfo.style || '';
        document.getElementById('info-date').textContent = formatDate(generalInfo.ngayKiem);
        
        const inspectorName = generalInfo.inspector || '';
        const infoInspector = document.getElementById('info-inspector');
        if (infoInspector) infoInspector.textContent = inspectorName;

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

                row.innerHTML = `
                    <td>${item.loai} - ${item.mau} - ${item.tsSize}</td>
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

        const inspectorWatermark = document.getElementById('inspector-watermark');
        const managerWatermark = document.getElementById('manager-watermark');
        
        if (inspectorName && inspectorWatermark) {
            const inspectorBoxStyle = `
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

        if (generalInfo.daDuyet === true && managerWatermark) {
            const managerName = generalInfo.nguoiDuyet || "QL Kho";
            const approveDate = generalInfo.ngayDuyet ? new Date(generalInfo.ngayDuyet).toLocaleDateString('vi-VN') : '';
            
            const managerBoxStyle = `
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
    });
});
