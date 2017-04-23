import { DtoResCollection } from '../../api/interfaces/dto_res';

export interface State {
    collections: DtoResCollection[];
}

export const initialState: State = {
    collections: []
};