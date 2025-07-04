// resources/js/api/request.ts
import axios from 'axios';

export async function submitRequest(data: any, mode: 'submit' | 'draft') {
    const response = await axios.post(
        route('user.request.submit'),
        { ...data, mode },
        {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content') || '',
            },
        }
    );
    return response.data;
}
