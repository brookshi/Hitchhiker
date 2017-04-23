import { ajax } from 'rxjs/observable/dom/ajax';
import { Epic } from 'redux-observable';
import { DtoResCollection } from '../../../api/interfaces/dto_res';


export const Fetch_Collection = 'fetch_collection';
export const Fetch_Collection_Fulfilled: string = 'fetch_collection_fulfilled';

export const fetchCollection = () => ({ type: Fetch_Collection });

export type FetchCollectionAction = { type: 'fetch_collection_fulfilled', payload: DtoResCollection[] };

const fetchCollectionFulfilled = (payload: DtoResCollection[]) => ({ type: Fetch_Collection_Fulfilled, payload });

export const fetchCollectionEpic: Epic<FetchCollectionAction, DtoResCollection[]> = (action$, store) => action$
    .ofType(Fetch_Collection)
    .mergeMap(action => {
        return ajax.getJSON('http://localhost:3000/api/collections', { "Content-Type": "application/json" })
            .map(res => {
                return fetchCollectionFulfilled(res as DtoResCollection[]);
            });
    });

