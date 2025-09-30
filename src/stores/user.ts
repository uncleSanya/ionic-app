import {defineStore} from 'pinia';

export interface UserData
{
    id: number;
    login: number;
    name: string;
    avatar: string;
}

interface UserState
{
    token: string | null;
    userData: UserData | null;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        token: null,
        userData: null,
    }),
    actions: {
        setAuth(token: string, userData: UserData)
        {
            this.token = token;
            this.userData = userData;
        },
        clearAuth()
        {
            this.token = null;
            this.userData = null;
        },
    },
});