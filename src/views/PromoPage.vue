<script setup lang="ts">
import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonImg,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonModal,
    IonPage,
    IonRefresher,
    IonRefresherContent, IonSpinner,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {onMounted, ref, watch} from 'vue';
import api from '@/services/api';
import {useLangStore} from '@/stores/lang';
import {arrowUpOutline, closeOutline, pricetagOutline} from 'ionicons/icons';

interface PromoItem
{
    id: number;
    title: string;
    description: string;
    text: string;
    image: string;
    publication_date: string;
    class: string;
}

const langStore = useLangStore();
const promos = ref<PromoItem[]>([]);
const page = ref(0);
const limit = 10;
const loading = ref(false);
const finished = ref(false);
const selectedItem = ref<PromoItem | null>(null);
const contentRef = ref<InstanceType<typeof IonContent> | null>(null);

function scrollToTop()
{
    contentRef.value?.$el.scrollToTop(500);
}

async function loadPromos(reset = false)
{
    if (loading.value || (finished.value && !reset))
    {
        return;
    }
    loading.value = true;

    try
    {
        if (reset)
        {
            page.value = 0;
            finished.value = false;
            promos.value = [];
        }

        const offset = page.value * limit;
        const result = await api.get('', {params: {action: 'GetPromo', limit, offset}});

        const items = result.data || [];
        if (items && items.length > 0)
        {
            promos.value.push(...items);
            page.value++;
        }
        else
        {
            finished.value = true;
        }
    }
    catch (error: any)
    {
        console.error('Promo load error', error);
    }
    finally
    {
        loading.value = false;
    }
}

async function doRefresh(event: CustomEvent)
{
    await loadPromos(true);
    (event.target as HTMLIonRefresherElement).complete();
}

async function loadMore(event: CustomEvent)
{
    await loadPromos();
    (event.target as HTMLIonInfiniteScrollElement).complete();
}

onMounted(() =>
{
    loadPromos(true);
});

watch(() => langStore.lang, async () =>
{
    await loadPromos(true);
});
</script>

<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ langStore.translations.promotions }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content ref="contentRef" class="ion-padding">
            <ion-refresher slot="fixed" @ionRefresh="doRefresh">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>

            <div v-if="loading" class="spinner-overlay">
                <ion-spinner></ion-spinner>
            </div>

            <ion-card v-else-if="promos.length === 0" class="empty-state-card">
                <ion-card-content class="ion-text-center">
                    <ion-icon :icon="pricetagOutline" size="large"></ion-icon>
                    <p>{{ langStore.translations.noPromo }}</p>
                </ion-card-content>
            </ion-card>

            <ion-card v-for="item in promos" :key="item.id" button @click="selectedItem = item">
                <ion-img v-if="item.image" :src="item.image"/>
                <ion-card-header>
                    <ion-card-title>{{ item.title }}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <small>{{ new Date(item.publication_date).toLocaleDateString() }}</small>
                </ion-card-content>
            </ion-card>

            <ion-infinite-scroll threshold="100px" @ionInfinite="loadMore" :disabled="finished">
                <ion-infinite-scroll-content loading-spinner="bubbles" :loading-text="langStore.translations.loading"/>
            </ion-infinite-scroll>

            <ion-modal :is-open="!!selectedItem" @didDismiss="selectedItem = null" :breakpoints="[0, 0.8, 1]"
                       :initial-breakpoint="0.8" handle-behavior="cycle" backdrop-dismiss="true" swipe-to-close="true">
                <ion-header>
                    <ion-toolbar>
                        <ion-title>{{ selectedItem?.title }}</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="selectedItem = null">
                                <ion-icon :icon="closeOutline"></ion-icon>
                            </ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <ion-img v-if="selectedItem?.image" :src="selectedItem?.image"></ion-img>
                    <div v-html="selectedItem?.text"></div>
                </ion-content>
            </ion-modal>

            <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                <ion-fab-button @click="scrollToTop">
                    <ion-icon :icon="arrowUpOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>