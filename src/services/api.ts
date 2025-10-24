import {Http} from '@capacitor-community/http';
import {Preferences} from '@capacitor/preferences';
import {useLangStore} from '@/stores/lang';
import {logout} from '@/services/auth';
import {alertController, loadingController, toastController} from '@ionic/vue';
import {getCachedTranslation} from "@/stores/langCache";

const baseHost = import.meta.env.MODE === 'development' ? '' : import.meta.env.VITE_API_HOST as string;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions
{
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
}

async function apiRequest(method: HttpMethod, endpoint: string, options: ApiOptions = {})
{
    const tokenData = await Preferences.get({key: 'auth_token'});
    const langStore = useLangStore();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (tokenData.value)
    {
        headers['Authorization'] = `Bearer ${tokenData.value}`;
    }

    const lang = await Preferences.get({key: 'lang'});
    const params = {
        ...(options.params || {}),
        SET_LANG_ID: String(langStore.getLangById((lang.value as 'ru' | 'en') || 'ru')),
    };

    const requestConfig: any = {
        method,
        url: `${baseHost}/api/ionic_api/${endpoint}`,
        headers,
        params,
    };
    if (method !== 'GET' && options.data)
    {
        requestConfig.data = options.data;
    }

    try
    {
        const response = await Http.request(requestConfig);
        if (typeof response.data !== 'object')
        {
            const toast = await toastController.create({
                message: await getCachedTranslation('serverUnavailable'),
                duration: 1500,
                position: 'bottom',
            });
            await toast.present();

            return {status: 400, data: null};
        }
        if (response.status === 401)
        {
            const topLoading = await loadingController.getTop();
            if (topLoading)
            {
                await topLoading.dismiss();
            }

            const alert = await alertController.create({
                message: await getCachedTranslation('sessionExpired'),
                buttons: ['OK'],
            });
            await alert.present();
            await alert.onDidDismiss();

            await logout();
            const {default: router} = await import('../router');
            router.push('/login').then(() =>
            {
                window.location.reload();
            });

            return response;
        }

        return response.data;
    }
    catch (error: any)
    {
        if (error.status === 401)
        {
            const topLoading = await loadingController.getTop();
            if (topLoading)
            {
                await topLoading.dismiss();
            }

            const alert = await alertController.create({
                message: await getCachedTranslation('sessionExpired'),
                buttons: ['OK'],
            });
            await alert.present();
            await alert.onDidDismiss();

            await logout();
            const {default: router} = await import('../router');
            router.push('/login').then(() =>
            {
                window.location.reload();
            });

            return error;
        }
        else
        {
            const toast = await toastController.create({
                message: await getCachedTranslation('serverUnavailable'),
                duration: 1500,
                position: 'bottom',
            });
            await toast.present();

            return {status: 400, data: null};
        }
        throw error;
    }
}

const api = {
    get: (endpoint: string, options: ApiOptions = {}) => apiRequest('GET', endpoint, options),
    post: (endpoint: string, data?: any, options: ApiOptions = {}) => apiRequest('POST', endpoint, {...options, data}),
    put: (endpoint: string, data?: any, options: ApiOptions = {}) => apiRequest('PUT', endpoint, {...options, data}),
    delete: (endpoint: string, options: ApiOptions = {}) => apiRequest('DELETE', endpoint, options),
};

export default api;
