const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 8000;
app.use(express.json());

const DEFAULT_COOKIE = '_ga=GA1.1.859283574.1763961477; _ga_XWW4JEB21X=GS2.1.s1782218304$o256$g1$t1782218311$j53$l0$h0; X-DRSITE=off; zalo_id=; zlp_token=3vSqzAySPUYc5s4UpgYb6KyWUHbfrPxzYuZE6C3SD2VYVFMAd7RQpXk6Z8xPJdkzGfpu3AtireHP5jnmDjKsjbvgPjvJdyk8Zy7nWcrHFocYEyyP2DDAsCmuKVcrXwXAT1mfsHY5n3wg4iNJAQ5272qfQDfjmXQoNSi7pzNdpkzG34M36jYm6; has_device_id=0';

// LINK MỚI GỌN GÀNG ĐỂ LẤY DỮ LIỆU NHẬN TIỀN
app.get('/api/zalopay-clean', async (req, res) => {
    const url = 'https://sapi.zalopay.vn/v2/history/transactions';
    const pageToken = req.query.page_token || 'eyJPZmZzZXQiOjE3NzYxNTEzMzg3Mjl9';
    const customCookie = req.query.cookie || DEFAULT_COOKIE;

    const config = {
        method: 'get',
        url: url,
        params: {
            page_size: '20',
            page_token: pageToken,
            category_id: '2'
        },
        headers: {
            'Host': 'sapi.zalopay.vn',
            'Sec-Fetch-Site': 'same-site',
            'Accept-Language': 'vi-VN,vi;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Sec-Fetch-Mode': 'cors',
            'Accept': '*/*',
            'Origin': 'https://social.zalopay.vn',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_11 like Mac OS X) AppleWebKit/8615.8.1.10.2, Copyright 2003-2023 Apple Inc. (KHTML, like Gecko) Mobile/20H351 ZaloPayClient/11.7.0 ZaloPayWebClient/11.7.0 OS/16.7.11 Platform/ios Secured/true',
            'Referer': 'https://social.zalopay.vn/spa/v2/history?main-app=true',
            'x-platform': 'ZPA',
            'Connection': 'keep-alive',
            'Cookie': customCookie,
            'Sec-Fetch-Dest': 'empty'
        }
    };

    try {
        const response = await axios(config);
        
        // Kiểm tra nếu cấu trúc ZaloPay trả về hợp lệ và có mảng giao dịch
        if (response.data && response.data.data && response.data.data.transactions) {
            const rawTransactions = response.data.data.transactions;
            
            // Bóc tách dữ liệu theo đúng ý mày (Chỉ lọc các giao dịch nhận tiền)
            const cleanData = rawTransactions
                .filter(tx => tx.sign === "+") // Chỉ lấy giao dịch NHẬN TIỀN (+)
                .map(tx => {
                    // Định dạng lại thời gian từ timestamp sang ngày giờ đọc được
                    const date = new Date(tx.time);
                    const formattedTime = date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

                    return {
                        trans_id: tx.trans_id,       // Mã giao dịch để check trùng
                        nguoi_chuyen: tx.partner_name || "Không rõ",
                        so_tien: tx.amount || 0,
                        noi_dung: tx.description || "",
                        thoi_gian: formattedTime
                    };
                });

            // Trả về kết quả đã được rút gọn siêu đẹp
            return res.status(200).json({
                success: true,
                total: cleanData.length,
                transactions: cleanData
            });
        } else {
            return res.status(200).json({ success: true, total: 0, transactions: [], message: "Không tìm thấy giao dịch nào" });
        }

    } catch (error) {
        res.status(error.response ? error.response.status : 500).json({
            success: false,
            message: "Lỗi kết nối ZaloPay hoặc Token/Cookie đã hết hạn!",
            error: error.message
        });
    }
});

// Giữ lại link cũ phòng khi mày cần dùng dữ liệu gốc
app.get('/', (req, res) => {
    res.send('ZaloPay API Gateway đang chạy ngon lành! Hãy dùng endpoint: /api/zalopay-clean');
});

app.listen(PORT, () => {
    console.log(`API đang chạy tại port ${PORT}`);
});
