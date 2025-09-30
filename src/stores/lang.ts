import {defineStore} from 'pinia';
import api from '@/services/api';
import {Preferences} from '@capacitor/preferences';
import {useUserStore} from '@/stores/user';
import {loadingController} from "@ionic/vue";
import {getCachedTranslation} from "@/stores/langCache";

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
        async setLang(lang: 'ru' | 'en')
        {
            this.lang = lang;
            await Preferences.set({key: 'lang', value: lang});

            const userStore = useUserStore();
            if (userStore.token)
            {
                await this.loadTranslations();
            }
        },

        async initLang()
        {
            const saved = await Preferences.get({key: 'lang'});
            this.lang = (saved.value as 'ru' | 'en') || 'ru';
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

        async loadTranslations()
        {
            const loading = await loadingController.create({
                message: await getCachedTranslation('loading'),
                spinner: 'crescent',
                backdropDismiss: false
            });

            await loading.present();
            const uiWords: Record<string, string> = {
                news: 'Новости',
                promo: 'Промо',
                promotions: 'Промоушены',
                wallet: 'Кошелек',
                activity: 'Активность',
                bonusActivity: 'Бонусная активность',
                notify: 'Уведомления',
                profile: 'Профиль',

                information: 'Информация',
                logout: 'Выйти',
                language: 'Язык',
                noNews: 'Нет новостей',
                noPromo: 'Нет доступных промо',
                all: 'Все',
                archived: 'Архив',
                archive: 'В архив',
                cancel: 'Отмена',
                unread: 'Непр.',
                noNotifications: 'Уведомлений нет',
                noArchiveNotifications: 'Архив пуст',
                confirmArchive: 'Переместить все уведомления в архив?',
                walletAvailableBalance: 'Сейчас доступно',
                thisMonth: 'Текущий месяц',
                nextMonth: 'Следующий месяц',
                inactiveBranches: 'Неактивные ветки',
                selfActivity: 'Личная',
                branchActivity: 'В ветках',

                yes: 'Да',
                yesRestrictions: 'Да, с ограничениями',
                no: 'Нет',
                branchWOActivity: 'Ветки без активности',

                sessionExpired: 'Сессия авторизации истекла',
                biometryReason: 'Вход в приложение',
                biometryTitle: 'Авторизация',
                biometrySubtitle: 'Подтвердите личность',
                loading: 'Загрузка...',
                serverUnavailable: 'Нет соединения с сервером',
            };

            try
            {
                const result = await api.post('', {translate_request: uiWords}, {params: {action: 'ChangeLanguage'}});
                if (result.status && result.status != 200)
                {
                    await this.loadCachedTranslations();
                    return;
                }
                if (result.translated_params)
                {
                    this.translations = result.translated_params as Translations;
                    await Preferences.set({key: `translations_${this.lang}`, value: JSON.stringify(this.translations)});
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
            }
            catch (error: any)
            {
                console.error('Language error', error);
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
