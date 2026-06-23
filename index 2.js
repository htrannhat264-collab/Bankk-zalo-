const express = require('express');
const axios = require('axios');
const app = express();

// Render tự động cấp PORT qua biến môi trường, mặc định là 3000 nếu chạy local
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Định nghĩa Endpoint API của bạn
app.get('/api/zalopay-history', async (req, res) => {
    const url = 'https://sapi.zalopay.vn/v2/history/transactions';
    
    // Lấy page_token từ URL request nếu có (ví dụ: /api/zalopay-history?page_token=xxx)
    // Nếu không truyền, mặc định sẽ lấy token bạn cung cấp bên dưới
    const pageToken = req.query.page_token || 'eyJPZmZzZXQiOjE3NzYxNTEzMzg3Mjl9';

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
            'Cookie': '_ga=GA1.1.859283574.1763961477; _ga_XWW4JEB21X=GS2.1.s1782218304$o256$g1$t1782218311$j53$l0$h0; X-DRSITE=off; zalo_id=; zlp_token=3vSqzAySPUYc5s4UpgYb6KyWUHbfrPxzYuZE6C3SD2VYVFMAd7RQpXk6Z8xPJdkzGfpu3AtireHP5jnmDjKsjbvgPjvJdyk8Zy7nWcrHFocYEyyP2DDAsCmuKVcrXwXAT1mfsHY5n3wg4iNJAQ5272qfQDfjmXQoNSi7pzNdpkzG34M36jYm6; has_device_id=0',
            'Sec-Fetch-Dest': 'empty'
        }
    };

    try {
        const response = await axios(config);
        // Trả về dữ liệu gốc từ ZaloPay cho client của bạn
        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        res.status(error.response ? error.response.status : 500).json({
            success: false,
            message: error.message,
            error: error.response ? error.response.data : null
        });
    }
});

// Endpoint kiểm tra trạng thái hoạt động của API
app.get('/', (req, res) => {
    res.send('ZaloPay API Gateway đang chạy mượt mà!');
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});
