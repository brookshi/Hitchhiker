import localForage from 'localforage';
import { State } from '../state/index';

export default class LocalStore {

    static init() {
        localForage.config({
            name: 'hitchhiker',
            version: 1.0,
            storeName: 'localState'
        });
    }

    static async setState(userId: string, state: State): Promise<void> {
        await localForage.setItem(LocalStore.getKey(userId), state);
    }

    static async getState(userId: string): Promise<State> {
        return await localForage.getItem(LocalStore.getKey(userId)) as State;
    }

    static async clearState(userId: string): Promise<any> {
        console.log(LocalStore.getKey(userId));
        return await localForage.removeItem(LocalStore.getKey(userId), err => console.error(err));
    }

    private static getKey(userId: string): string {
        return `state-${userId}`;
    }
}