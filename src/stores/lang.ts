import {defineStore} from 'pinia';
import api from '@/services/api';
import {Preferences} from '@capacitor/preferences';
import {useUserStore} from '@/stores/user';
import {loadingController} from "@ionic/vue";
import {getCachedTranslation} from "@/stores/langCache";
import {uiWords} from "@/stores/langKeys";

export interface Translations
{
    [key: string]: string;
}

interface LangState
{
    lang: 'ru' | 'en' | null;
    translations: Translations;
}

export const useLangStore = defineStore('lang', {
    state: (): LangState => ({
        lang: null,
        translations: {},
    }),
    actions: {
        async setLang(lang: 'ru' | 'en', fromLogin = false)
        {
            if (fromLogin)
            {
                this.lang = lang;
                await Preferences.set({key: 'lang', value: lang});
            }
            else
            {
                const prevLang = this.lang || 'ru';
                await Preferences.set({key: 'lang', value: lang});

                const success = await this.fetchTranslations(lang);
                if (success)
                {
                    this.lang = lang;
                }
                else
                {
                    await Preferences.set({key: 'lang', value: prevLang});
                }
            }
        },

        async initLang()
        {
            const saved = await Preferences.get({key: 'lang'});
            console.log(saved)
            this.lang = (saved.value as 'ru' | 'en') || 'ru';
            console.log(this.lang)
            await this.loadCachedTranslations();
        },
        async getLangId()
        {
            if (!this.lang)
            {
                const saved = await Preferences.get({key: 'lang'});
                this.lang = (saved.value as 'ru' | 'en') || 'ru';
            }
            return this.lang === 'ru' ? 1 : 2;
        },
        getLangById(language: string)
        {
            return language === 'ru' ? 1 : 2;
        },

        async loadTranslations()
        {
            if (!this.lang)
            {
                const saved = await Preferences.get({key: 'lang'});
                this.lang = (saved.value as 'ru' | 'en') || 'ru';
            }
            await this.fetchTranslations(this.lang);
        },

        async fetchTranslations(lang: 'ru' | 'en'): Promise<boolean>
        {
            const loading = await loadingController.create({
                message: await getCachedTranslation('loading'),
                spinner: 'crescent',
                backdropDismiss: false
            });
            await loading.present();

            try
            {
                const result = await api.post('', {translate_request: uiWords}, {params: {action: 'ChangeLanguage'}});
                if (result.status && result.status != 200)
                {
                    await this.loadCachedTranslations();
                    return false;
                }
                if (result.translated_params)
                {
                    this.translations = result.translated_params as Translations;
                    await Preferences.set({key: `translations_${lang}`, value: JSON.stringify(this.translations)});
                }

                if (result.user)
                {
                    const userStore = useUserStore();
                    const tokenData = await Preferences.get({key: 'auth_token'});
                    if (tokenData.value)
                    {
                        userStore.setAuth(tokenData.value, result.user);
                    }
                }

                return true;
            }
            catch (error: any)
            {
                console.error("Language fetch error", error);
                await this.loadCachedTranslations();
                return false;
            }
            finally
            {
                await loading.dismiss();
            }
        },
        async loadCachedTranslations()
        {
            const cached = await Preferences.get({key: `translations_${this.lang}`});
            if (cached.value)
            {
                this.translations = JSON.parse(cached.value);
            }
        },
    },
});
