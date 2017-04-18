import { ajax } from 'rxjs/observable/dom/ajax';
import { Epic } from 'redux-observable';


export const Fetch_Collection = 'fetch_collection';
export const Fetch_Collection_Fulfilled = 'fetch_collection_fulfilled';

export const fetchCollection = () => ({ type: Fetch_Collection });

export type FetchCollectionAction = { type: 'fetch_collection_fulfilled', payload: any };

export const fetchCollectionFulfilled = payload => ({ type: Fetch_Collection_Fulfilled, payload });

export const fetchCollectionEpic: Epic<FetchCollectionAction, any> = (action$, store) => action$
    .ofType(Fetch_Collection)
    .mergeMap(action =>
        ajax.getJSON('').map(res => fetchCollectionFulfilled(res))
    );


