//import { DtoCollection } from "../../../api/interfaces/dto_collection";
import { Fetch_Collection_Fulfilled } from "../actions/collections";

export function collections(state: {} = {}, action: any): any {
    switch (action.type) {

        case Fetch_Collection_Fulfilled:
            return { ...state, 'collections': action.payload };
        default:
            return state;
    }
};