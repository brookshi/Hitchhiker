import { Fetch_Collection_Fulfilled } from '../actions/collections';
import { DtoResCollection } from '../../../api/interfaces/dto_res';

export function collections(state: DtoResCollection[] = [], action: any): DtoResCollection[] {
    switch (action.type) {

        case Fetch_Collection_Fulfilled:
            return action.payload;
        default:
            return state;
    }
};