import {Preferences} from '@capacitor/preferences';

export async function getCachedTranslation(key: string): Promise<string>
{
    const langPref = await Preferences.get({key: 'lang'});
    const lang = (langPref.value as 'ru' | 'en') || 'ru';

    const cached = await Preferences.get({key: `translations_${lang}`});
    if (cached.value)
    {
        try
        {
            const parsed = JSON.parse(cached.value);
            if (parsed[key])
            {
                return parsed[key];
            }
        }
        catch
        {
            return '';
        }
    }

    return fallbackText(key);
}

function fallbackText(key: string): string
{
    const fallback: Record<string, string> = {
        sessionExpired: 'Session expired',
        loading: 'Loading...',
        serverUnavailable: 'Server unavailable',
    };

    return fallback[key] || key;
}
