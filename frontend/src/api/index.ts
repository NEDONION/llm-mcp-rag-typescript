import axios from 'axios';

/**
 * 流式回答
 */
export const fetchAIResponse = async (
    input: string, _p0: never[], onData: (data: string) => void, _messageType: string, signal?: AbortSignal): Promise<void> => {
    try {
        const eventSource = new EventSource(
            `/api/agent/stream?question=${encodeURIComponent(input)}&context=&systemPrompt=`,
            { withCredentials: false }
        );

        // 如果外部传入中止信号，则在触发时关闭 EventSource
        if (signal) {
            signal.addEventListener('abort', () => {
                eventSource.close();
                onData('\n[已停止回复]');
            });
        }

        eventSource.onmessage = (event) => {
            if (event.data === '[DONE]') {
                eventSource.close();
            } else {
                onData(event.data);
            }
        };

        eventSource.onerror = (err) => {
            console.error('SSE 连接错误:', err);
            eventSource.close();
            onData('[连接已关闭]');
        };
    } catch (error) {
        console.error('Error fetching AI response:', error);
        onData('Error fetching AI response');
    }
};


/**
 * 单轮问答：发送一次性问题请求，获取完整回答（非流式）
 */
export const fetchAIResponseOnce = async (
  input: string, _p0: never[], onData: (data: string) => void, _messageType: string, signal?: AbortSignal): Promise<void> => {
    try {
        const response = await axios.post(
            '/api/agent/chat',
            {
                question: input,
                context: '',
                systemPrompt: '',
            },
            { signal }
        );

        if (response.data?.answer) {
            onData(response.data.answer);
        } else {
            onData('未获取到模型回答');
        }
    } catch (error: any) {
        if (error.name === 'CanceledError') {
            onData('\n[已停止回复]');
        } else {
            console.error('单次请求发生错误:', error);
            onData('发生错误，请重试');
        }
    }
};

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.code === 0) {
            return response.data.data;
        } else {
            throw new Error(response.data.data);
        }
    } catch (error) {
        console.error('上传文件发生错误：', error);
        throw error;
    }
};
