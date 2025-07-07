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

// Create a wrapper function that returns a promise with loading state
export function createSubmitRequestWithLoading() {
    let loading = false;
    
    const submit = async (data: any, mode: 'submit' | 'draft') => {
        loading = true;
        try {
            const result = await submitRequest(data, mode);
            return { data: result, loading: false };
        } catch (error) {
            loading = false;
            throw error;
        }
    };
    
    return {
        submit,
        get loading() { return loading; }
    };
}
