<script setup lang="ts">
import {
    alertController,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    onIonViewWillEnter
} from '@ionic/vue';
import {ref} from 'vue';
import {useLangStore} from '@/stores/lang';
import {useNotificationsStore} from '@/stores/notifications';
import {archiveOutline, closeOutline, notificationsOutline} from 'ionicons/icons';
import api from '@/services/api';

const langStore = useLangStore();
const notifyStore = useNotificationsStore();

const notifyType = ref<'all' | 'archive'>('all');

const showHtmlModal = ref(false);
const selectedHtml = ref('');

onIonViewWillEnter(async () =>
{
    if (notifyStore.newCount > 0)
    {
        await notifyStore.markViewed();
    }
});

async function doRefresh(event: CustomEvent)
{
    await notifyStore.fetchAll();
    (event.target as HTMLIonRefresherElement).complete();
}

async function moveToArchive()
{
    const alert = await alertController.create({
        message: langStore.translations.confirmArchive,
        buttons: [
            {text: langStore.translations.cancel, role: 'cancel'},
            {text: 'OK', role: 'confirm'}
        ]
    });
    await alert.present();
    const {role} = await alert.onDidDismiss();
    if (role === 'confirm')
    {
        await notifyStore.moveAllToArchive();
        notifyType.value = 'archive';
    }
}

// todo модалка о партнере
async function handleLinkClick(event: MouseEvent)
{
    const target = event.target as HTMLAnchorElement;
    if (target.tagName.toLowerCase() === 'a')
    {
        event.preventDefault();
        const url = target.getAttribute('href');
        if (url)
        {
            const params = new URL(url).searchParams;
            const partnerId = params.get('partner');
            if (partnerId)
            {
                try
                {
                    const result = await api.get('', {params: {action: 'GetPartnerInfo', partner: partnerId}});
                    if (result && result.html)
                    {
                        selectedHtml.value = result.html;
                        showHtmlModal.value = true;
                    }
                }
                catch (error: any)
                {
                    console.error('GetPartnerInfo error', error);
                }
            }
        }
    }
}
</script>

<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ langStore.translations.notify }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="moveToArchive">
                        <ion-icon :icon="archiveOutline" slot="start"/>
                        {{ langStore.translations.archive }}
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>

            <ion-toolbar>
                <ion-segment v-model="notifyType">
                    <ion-segment-button value="all">
                        <ion-label>{{ langStore.translations.all }}</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="archive">
                        <ion-label>{{ langStore.translations.archived }}</ion-label>
                    </ion-segment-button>
                </ion-segment>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-refresher slot="fixed" @ionRefresh="doRefresh">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>

            <ion-list v-if="notifyType === 'all'">
                <ion-item v-for="notify in notifyStore.all" :key="notify.id" :color="notify.critical ? 'warning' : 'light'" lines="inset">
                    <ion-label class="ion-text-wrap">
                        <div v-html="notify.notify" @click="handleLinkClick"></div>
                        <small v-if="notify.date">{{ new Date(notify.date).toLocaleString() }}</small>
                    </ion-label>
                    <ion-badge v-if="notify.viewed === 0" color="primary" slot="end">
                        {{ langStore.translations.unread }}
                    </ion-badge>
                </ion-item>

                <ion-card v-if="!notifyStore.loading && notifyStore.all.length === 0" class="empty-state-card">
                    <ion-card-content class="ion-text-center">
                        <ion-icon :icon="notificationsOutline" size="large"></ion-icon>
                        <p>{{ langStore.translations.noNotifications }}</p>
                    </ion-card-content>
                </ion-card>

            </ion-list>

            <ion-list v-else>
                <ion-item v-for="notify in notifyStore.archive" :key="notify.id" :color="notify.critical ? 'warning' : 'light'" lines="inset">
                    <ion-label class="ion-text-wrap">
                        <div v-html="notify.notify" @click="handleLinkClick"></div>
                        <small v-if="notify.date">{{ new Date(notify.date).toLocaleString() }}</small>
                    </ion-label>
                </ion-item>

                <ion-card v-if="!notifyStore.loading && notifyStore.archive.length === 0" class="empty-state-card">
                    <ion-card-content class="ion-text-center">
                        <ion-icon :icon="archiveOutline" size="large"></ion-icon>
                        <p>{{ langStore.translations.noArchiveNotifications }}</p>
                    </ion-card-content>
                </ion-card>

            </ion-list>

<!--            todo модалка вывода информацуии о партнере-->
            <ion-modal :is-open="showHtmlModal" @didDismiss="showHtmlModal = false">
                <ion-header>
                    <ion-toolbar>
                        <ion-title>{{ langStore.translations.information }}</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="showHtmlModal = false">
                                <ion-icon :icon="closeOutline"></ion-icon>
                            </ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <div v-html="selectedHtml"></div>
                </ion-content>
            </ion-modal>
        </ion-content>
    </ion-page>
</template>