<script setup lang="ts">
import {
    IonAccordion,
    IonAccordionGroup,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {onMounted, ref} from 'vue';
import api from "@/services/api";
import {useLangStore} from '@/stores/lang';
import {checkmarkCircleOutline, closeCircleOutline} from 'ionicons/icons';

const langStore = useLangStore();
const wallets = ref<any[]>([]);
const bonusActivity = ref<any | null>(null);
const loading = ref(true);

async function loadWallet()
{
    try
    {
        const result = await api.get('', {params: {action: 'GetPartnerBalance'}});
        wallets.value = result.balance || [];
        bonusActivity.value = result.bonus_activity || null;
    }
    catch (error: any)
    {
        console.error('Wallet load error', error);
    }
    finally
    {
        loading.value = false;
    }
}

async function doRefresh(event: CustomEvent)
{
    await loadWallet();
    (event.target as HTMLIonRefresherElement).complete();
}

onMounted(() =>
{
    loadWallet();
});

function renderActivity(activity: any, isNextMonth = false)
{
    const items: { label: string, done: boolean, delayed?: boolean, branches?: string[] }[] = [];
    if (activity.sac_data.sac_v1)
    {
        items.push({label: langStore.translations.selfActivity, done: true});
    }
    else if (!isNextMonth && activity.sac_data.sac_v2)
    {
        items.push({label: langStore.translations.selfActivity, done: true, delayed: true});
    }
    else
    {
        items.push({label: langStore.translations.selfActivity, done: false});
    }

    if (activity.bac_data.bac_v1)
    {
        items.push({label: langStore.translations.branchActivity, done: true});
    }
    else if (!isNextMonth && activity.bac_data.bac_v2)
    {
        items.push({label: langStore.translations.branchActivity, done: true, delayed: true});
    }
    else
    {
        items.push({label: langStore.translations.branchActivity, done: false, branches: activity.bac_data.bac_v1_data});
    }

    return items;
}
</script>

<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ langStore.translations.wallet }}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-refresher slot="fixed" @ionRefresh="doRefresh">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>

            <div v-if="loading" class="spinner-overlay">
                <ion-spinner></ion-spinner>
            </div>

            <div v-else>
                <ion-card v-if="bonusActivity">
                    <ion-card-header>
                        <ion-card-title>{{ langStore.translations.bonusActivity }}</ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <div v-if="!bonusActivity.available">{{ bonusActivity.message }}</div>

                        <div v-else>
                            <h3>{{ langStore.translations.thisMonth }}</h3>
                            <ul>
                                <li v-for="(item, i) in renderActivity(bonusActivity.this_month)" :key="'this'+i">
                                    <ion-icon :icon="item.done ? checkmarkCircleOutline : closeCircleOutline" :color="item.done ? 'success' : 'danger'"/>
                                    {{ item.label }} —
                                    <span v-if="item.done && item.delayed">{{ langStore.translations.yesRestrictions }}</span>
                                    <span v-else-if="item.done">{{ langStore.translations.yes }}</span>
                                    <span v-else>{{ langStore.translations.no }}</span>
                                    <div v-if="item.branches && item.branches.length">
                                        {{ langStore.translations.branchWOActivity }}: {{ item.branches.join(', ') }}
                                    </div>
                                </li>
                            </ul>

                            <h3>{{ langStore.translations.nextMonth }}</h3>
                            <ul>
                                <li v-for="(item, i) in renderActivity(bonusActivity.next_month, true)" :key="'next'+i">
                                    <ion-icon :icon="item.done ? checkmarkCircleOutline : closeCircleOutline" :color="item.done ? 'success' : 'danger'"/>
                                    {{ item.label }} —
                                    <span v-if="item.done">{{ langStore.translations.yes }}</span>
                                    <span v-else>{{ langStore.translations.no }}</span>
                                    <div v-if="item.branches && item.branches.length">
                                        {{ langStore.translations.branchWOActivity }}: {{ item.branches.join(', ') }}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </ion-card-content>
                </ion-card>

                <ion-card v-if="wallets.length === 1">
                    <ion-card-header>
                        <ion-card-title>
                            {{ wallets[0].monetary_zone_data.name }} ({{ wallets[0].monetary_zone_data.currency }})
                        </ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        {{ wallets[0].withdraw_available_with_currency }}
                    </ion-card-content>
                </ion-card>

                <ion-accordion-group v-else expand="inset">
                    <ion-accordion v-for="wallet in wallets" :key="wallet.wallet_data.id" :value="wallet.wallet_data.id">
                        <ion-item slot="header">
                            <ion-label>
                                {{ wallet.monetary_zone_data.name }} ({{ wallet.monetary_zone_data.currency }})
                            </ion-label>
                        </ion-item>
                        <div class="ion-padding" slot="content">
                            <p><b>{{ langStore.translations.walletAvailableBalance }}:</b>{{ wallet.withdraw_available_with_currency }}</p>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
            </div>
        </ion-content>
    </ion-page>
</template>