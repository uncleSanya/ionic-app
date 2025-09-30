<script setup lang="ts">
import {
    IonAvatar,
    IonBadge,
    IonIcon,
    IonLabel,
    IonPage,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs
} from '@ionic/vue';
import {
    barChartOutline,
    newspaperOutline,
    notificationsOutline,
    personCircleOutline,
    pricetagOutline
} from 'ionicons/icons';
import {useUserStore} from '@/stores/user';
import {useLangStore} from '@/stores/lang';
import {useNotificationsStore} from '@/stores/notifications';
import {onMounted} from 'vue';

const userStore = useUserStore();
const langStore = useLangStore();
const notifyStore = useNotificationsStore();

onMounted(async () =>
{
    await notifyStore.fetchAll();
});
</script>

<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="news" href="/main/news">
                    <ion-icon :icon="newspaperOutline"></ion-icon>
                    <ion-label>{{ langStore.translations.news }}</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="promo" href="/main/promo">
                    <ion-icon :icon="pricetagOutline"/>
                    <ion-label>{{ langStore.translations.promo }}</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="bonusActivity" href="/main/wallet">
                    <ion-icon :icon="barChartOutline"/>
                    <ion-label>{{ langStore.translations.wallet }}</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="notify" href="/main/notify">
                    <ion-icon :icon="notificationsOutline"/>
                    <ion-label>{{ langStore.translations.notify }}</ion-label>
                    <ion-badge v-if="notifyStore.newCount > 0" color="danger">{{ notifyStore.newCount }}</ion-badge>
                </ion-tab-button>

                <ion-tab-button tab="profile" href="/main/profile">
                    <ion-avatar v-if="userStore.userData?.avatar">
                        <img :src="userStore.userData.avatar" alt="Я"/>
                    </ion-avatar>
                    <ion-icon v-else :icon="personCircleOutline"/>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>