import {API_BASE_URL} from "../config/api"; // 导入基础 URL


// 登录接口成功响应的结构
interface LoginResponse {
    token: string;
    // 如果后端还有其他字段，例如 user_info，也可以在这里添加
    // user_info: any;
}

export const loginApi = async (username: string, password: string): Promise<LoginResponse> => {
    const url = `${API_BASE_URL}/user/login`; // 注意：这里我将 /users 改为 /user 以匹配您的 FastAPI prefix

    const requestBody = {
        loginid: username,
        password: password,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            // 默认错误信息使用日文提示（与前端 message.error 保持一致）
            const defaultErrorMessage = 'ログインに失敗しました';
            let errorMessage = defaultErrorMessage;

            // 1. 尝试克隆响应，因为读取一次 body 后流就会关闭
            const clonedResponse = response.clone();

            try {
                // 2. 尝试解析后端返回的 JSON 错误体
                const errorData = await clonedResponse.json();

                // 3. 假设 FastAPI 或其他后端返回的错误信息字段是 'detail' 或 'message'
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    // 如果解析成功但找不到特定的 message 字段，则使用默认值
                    errorMessage = defaultErrorMessage;
                }

            } catch (e) {
                // 4. 如果响应体不是有效的 JSON (例如，后端返回纯文本或空体)，
                //    则检查状态码，如果状态码不是 4xx 或 5xx，再用默认提示
                if (response.status >= 400 && response.status < 600) {
                    // 明确是 HTTP 错误，但无法解析具体信息，使用默认提示
                    errorMessage = defaultErrorMessage;
                } else {
                    // 其他情况，如网络断开但 response 已经收到
                    errorMessage = `HTTP 错误: ${response.status} ${response.statusText}`;
                }
            }

            // 抛出带有具体或默认错误信息的 Error
            throw new Error(errorMessage);
        }

        // 成功响应处理
        const data: LoginResponse = await response.json();
        return data;

    } catch (error) {
        console.error('Login API Error:', error);
        throw error;
    }
};