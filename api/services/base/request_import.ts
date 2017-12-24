import { Record } from '../../models/record';

export interface RequestImport<T> {

    convert(target: T, collectionId: string): Record;
}