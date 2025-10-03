<script setup lang="ts">
import {
    IonAvatar,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {personCircleOutline} from 'ionicons/icons';
import {useUserStore} from '@/stores/user';
import {useLangStore} from '@/stores/lang';
import {logout} from '@/services/auth';
import {useRouter} from 'vue-router';
import {computed} from 'vue';

const userStore = useUserStore();
const langStore = useLangStore();
const router = useRouter();

const langModel = computed({
    get: () => langStore.lang || 'ru',
    set: (val) => langStore.setLang(val)
});

async function doLogout()
{
    await logout();
    router.push('/login').then(() =>
    {
        window.location.reload();
    });
}
</script>

<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ langStore.translations.profile }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="profile-wrapper ion-padding">
            <div class="profile-header">
                <ion-avatar v-if="userStore.userData?.avatar">
                    <img :src="userStore.userData.avatar" alt="Я"/>
                </ion-avatar>
                <ion-icon v-else :icon="personCircleOutline" size="large"/>
                <h2>{{ userStore.userData?.name }}</h2>
            </div>

            <ion-item>
                <ion-label>{{ langStore.translations.language }}</ion-label>
                <ion-select interface="action-sheet" v-model="langModel">
                    <ion-select-option value="ru">Русский</ion-select-option>
                    <ion-select-option value="en">English</ion-select-option>
                </ion-select>
            </ion-item>
        </ion-content>

        <ion-footer>
            <ion-toolbar>
                <ion-button expand="block" color="danger" @click="doLogout">
                    {{ langStore.translations.logout }}
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>