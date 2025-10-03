import api from './api';
import {Preferences} from '@capacitor/preferences';
import {useUserStore} from '@/stores/user';
import {useLangStore} from '@/stores/lang';
import {isBiometryAvailable, saveCredentials} from '@/services/biometry';

interface UserData
{
    id: number;
    login: number;
    name: string;
    avatar: string;
}

interface AuthResponse
{
    status: 'OK' | 'ERROR';
    token?: string;
    user?: UserData;
    message?: string;
}

export async function clearPreferencesExceptLang()
{
    const {keys} = await Preferences.keys();
    for (const key of keys)
    {
        if (key !== 'lang')
        {
            await Preferences.remove({key});
        }
    }
}

export async function login(partner_login: string, password: string): Promise<AuthResponse>
{
    const result = await api.post('', {partner_login, password}, {params: {action: 'Auth'}});
    if (result.status === 'OK' && result.token && result.user)
    {
        const userStore = useUserStore();
        userStore.setAuth(result.token, result.user);

        await Preferences.set({key: 'user_data', value: JSON.stringify(result.user)});
        await Preferences.set({key: 'auth_token', value: result.token});

        const langStore = useLangStore();
        await langStore.loadTranslations();

        if (await isBiometryAvailable())
        {
            await saveCredentials(partner_login, password);
        }
    }

    return result;
}

export async function logout(): Promise<void>
{
    const userStore = useUserStore();
    userStore.clearAuth();

    await clearPreferencesExceptLang();
    // await clearCredentials();
}
