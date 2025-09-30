import {defineStore} from 'pinia';
import api from '@/services/api';

export interface NotificationItem
{
    id: number;
    notify: string;
    date?: string;
    critical?: number;
    viewed?: number;
}

interface NotificationsState
{
    newCount: number;
    all: NotificationItem[];
    archive: NotificationItem[];
    loading: boolean;
}

export const useNotificationsStore = defineStore('notifications', {
    state: (): NotificationsState => ({
        newCount: 0,
        all: [],
        archive: [],
        loading: false,
    }),
    actions: {
        async fetchAll()
        {
            if (this.loading)
            {
                return;
            }
            this.loading = true;
            try
            {
                const result = await api.get('', {params: {action: 'GetNotifications'}});
                this.newCount = result.new_notification || 0;
                this.all = result.all_notification || [];
                this.archive = result.archive_notification || [];
            }
            finally
            {
                this.loading = false;
            }
        },

        async markViewed()
        {
            try
            {
                await api.post('', {}, {params: {action: 'NotificationViewed'}});
                this.newCount = 0;
            }
            catch
            {
                return;
            }
        },

        async moveAllToArchive()
        {
            try
            {
                await api.post('', {}, {params: {action: 'NotificationArchived'}});
                await this.fetchAll();
            }
            catch
            {
                return;
            }
        }
    }
});
