import { ajax } from 'rxjs/observable/dom/ajax';
import { Epic } from 'redux-observable';
//import { DtoResCollection } from '../../../api/interfaces/dto_res';


export const Fetch_Collection = 'fetch_collection';
export const Fetch_Collection_Fulfilled: string = 'fetch_collection_fulfilled';

export const fetchCollection = () => ({ type: Fetch_Collection });

export type FetchCollectionAction = { type: 'fetch_collection_fulfilled', payload: any };

const fetchCollectionFulfilled = (payload: any) => ({ type: Fetch_Collection_Fulfilled, payload });

export const fetchCollectionEpic: Epic<FetchCollectionAction, any> = (action$, store) => action$
    .ofType(Fetch_Collection)
    .mergeMap(action =>
        ajax.getJSON('').map(res => fetchCollectionFulfilled(res))
    );

