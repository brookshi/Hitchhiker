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
        await localForage.setItem(`state-${userId}`, state);
    }

    static async getState(userId: string): Promise<State> {
        return await localForage.getItem(`state-${userId}`) as State;
    }
}