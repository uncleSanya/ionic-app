import {Preferences} from '@capacitor/preferences';
import {useUserStore} from '@/stores/user';
import {useLangStore} from '@/stores/lang';
import {getCredentials, isBiometryAvailable, verifyBiometry} from '@/services/biometry';
import {login} from '@/services/auth';

interface Credentials
{
    login: string;
    password: string;
}

export async function initAuth(): Promise<boolean>
{
    const tokenData = await Preferences.get({key: 'auth_token'});
    const userData = await Preferences.get({key: 'user_data'});

    if (tokenData.value && userData.value)
    {
        const userStore = useUserStore();
        userStore.setAuth(tokenData.value, JSON.parse(userData.value));

        const langStore = useLangStore();
        await langStore.loadTranslations();

        return true;
    }

    if (await isBiometryAvailable())
    {
        const creds: Credentials | null = await getCredentials();
        if (creds)
        {
            const ok = await verifyBiometry();
            if (ok)
            {
                const result = await login(creds.login, creds.password);
                return result.status === 'OK';
            }
        }
    }

    return false;
}
