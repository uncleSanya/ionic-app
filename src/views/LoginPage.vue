<script setup lang="ts">
import {computed, ref} from 'vue';
import {
    alertController,
    IonButton,
    IonContent,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonSelect,
    IonSelectOption,
    onIonViewWillEnter
} from '@ionic/vue';
import {useRouter} from 'vue-router';
import {login} from '@/services/auth';
import {useLangStore} from '@/stores/lang';

const router = useRouter();
const partner_login = ref('');
const password = ref('');

const langStore = useLangStore();

const langModel = computed({
    get: () => langStore.lang || 'ru',
    set: (val) => langStore.setLang(val, true)
});
onIonViewWillEnter(async () =>
{
    await langStore.initLang();
    console.log(langModel)
});

const glossary = {
    ru: {
        login: 'Логин',
        password: 'Пароль',
        enter: 'Войти',
        fillFields: 'Введите логин и пароль',
        error: 'Ошибка авторизации',
        chooseLang: 'Выберите язык'
    },
    en: {
        login: 'Login',
        password: 'Password',
        enter: 'Sign in',
        fillFields: 'Enter login and password',
        error: 'Authorization error',
        chooseLang: 'Choose language'
    }
};
const words = computed(() => glossary[langStore.lang || 'ru']);

async function doLogin()
{
    if (!partner_login.value || !password.value)
    {
        const alert = await alertController.create({
            message: words.value.fillFields,
            buttons: ['OK'],
        });
        await alert.present();
        return;
    }
    try
    {
        const auth_status = await login(partner_login.value, password.value);
        if (auth_status.status !== 'OK')
        {
            const alert = await alertController.create({
                message: auth_status.message,
                buttons: ['OK'],
            });
            await alert.present();
            return;
        }
        router.push('/main');
    }
    catch
    {
        const alert = await alertController.create({
            message: words.value.error,
            buttons: ['OK'],
        });
        await alert.present();
    }
}
</script>

<template>
    <ion-page>
        <ion-content>
            <form @submit.prevent="doLogin" class="login-form">
                <ion-img class="login-form__image" src="/image/aplgo_logo_orange.svg"></ion-img>

                <ion-item class="login-form__item">
                    <ion-input v-model="partner_login" :placeholder="words.login" required></ion-input>
                </ion-item>

                <ion-item class="login-form__item">
                    <ion-input v-model="password" type="password" :placeholder="words.password" required></ion-input>
                </ion-item>

                <ion-button class="login-form__button" type="submit" :disabled="!partner_login || !password">
                    {{ words.enter }}
                </ion-button>
            </form>

            <ion-item>
                <ion-label>{{ words.chooseLang }}</ion-label>
                <ion-select interface="action-sheet" v-model="langModel">
                    <ion-select-option value="ru">Русский</ion-select-option>
                    <ion-select-option value="en">English</ion-select-option>
                </ion-select>
            </ion-item>
        </ion-content>
    </ion-page>
</template>
