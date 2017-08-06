import { collectionState } from '../collection';
import { actionCreator } from '../../action/index';
import { collectionDefaultValue } from '../../state/collection';
import { FetchCollectionSuccessType, FetchCollectionPendingType, FetchCollectionFailedType, SelectedProjectChangedType, CollectionOpenKeysType, SaveCollectionType, DeleteCollectionType } from '../../action/collection';
import { RequestStatus } from '../../common/request_status';
import { SaveAsRecordType, SaveRecordType, MoveRecordType, DeleteRecordType } from '../../action/record';
import { RecordCategory } from '../../common/record_category';

test('fetch collection success', () => {

    let state = collectionState(collectionDefaultValue, actionCreator(FetchCollectionSuccessType, { collections: { ['cid']: { id: 'cid', name: 'c1' } }, records: { ['cid']: { ['rid']: { id: 'rid', name: 'r1' } } } }));

    expect(state).toEqual({ ...collectionDefaultValue, collectionsInfo: { collections: { ['cid']: { id: 'cid', name: 'c1' } }, records: { ['cid']: { ['rid']: { id: 'rid', name: 'r1' } } } }, fetchCollectionState: { status: RequestStatus.success }, openKeys: ['cid'] });
});

test('fetch collection pending', () => {

    let state = collectionState(collectionDefaultValue, actionCreator(FetchCollectionPendingType));

    expect(state).toEqual({ ...collectionDefaultValue, fetchCollectionState: { status: RequestStatus.pending } });
});

test('fetch collection failed', () => {

    let state = collectionState(collectionDefaultValue, actionCreator(FetchCollectionFailedType, 'fetch failed'));

    expect(state).toEqual({ ...collectionDefaultValue, fetchCollectionState: { status: RequestStatus.failed, message: 'fetch failed' } });
});

test('select project', () => {

    let state = collectionState(collectionDefaultValue, actionCreator(SelectedProjectChangedType, 'pid'));

    expect(state).toEqual({ ...collectionDefaultValue, selectedProject: 'pid' });
});

test('open keys', () => {

    let state = collectionState(collectionDefaultValue, actionCreator(CollectionOpenKeysType, ['cid1', 'cid2']));

    expect(state).toEqual({ ...collectionDefaultValue, openKeys: ['cid1', 'cid2'] });
});

test('save as record', () => {

    let state = collectionState(collectionDefaultValue, actionCreator(SaveAsRecordType, { record: { id: 'rid_1', collectionId: 'cid_1', name: 'r1' } }));

    expect(state).toEqual({ ...collectionDefaultValue, collectionsInfo: { ...collectionDefaultValue.collectionsInfo, records: { ['cid_1']: { ['rid_1']: { id: 'rid_1', collectionId: 'cid_1', name: 'r1' } } } } });
});

test('save record', () => {

    let oldState = { ...collectionDefaultValue, collectionsInfo: { ...collectionDefaultValue.collectionsInfo, records: { ['cid_1']: { ['rid_1']: { id: 'rid_1', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record } } } } }

    let state = collectionState(oldState, actionCreator(SaveRecordType, { record: { id: 'rid_1', collectionId: 'cid_1', name: 'r2' } }));

    expect(state).toEqual({ ...collectionDefaultValue, collectionsInfo: { ...collectionDefaultValue.collectionsInfo, records: { ['cid_1']: { ['rid_1']: { id: 'rid_1', collectionId: 'cid_1', name: 'r2' } } } } });
});

test('move record', () => {

    let oldState = { ...collectionDefaultValue, collectionsInfo: { ...collectionDefaultValue.collectionsInfo, records: { ['cid_1']: { ['rid_1']: { id: 'rid_1', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record } } } } }

    let state = collectionState(oldState, actionCreator(MoveRecordType, { record: { id: 'rid_1', collectionId: 'cid_2', name: 'r1' } }));

    expect(state).toEqual({ ...collectionDefaultValue, collectionsInfo: { ...collectionDefaultValue.collectionsInfo, records: { ['cid_1']: {}, ['cid_2']: { ['rid_1']: { id: 'rid_1', collectionId: 'cid_2', name: 'r1' } } } } });
});

test('save collection', () => {

    let state = collectionState(collectionDefaultValue, actionCreator(SaveCollectionType, { collection: { id: 'cid_1', name: 'c1' } }));

    expect(state).toEqual({ ...collectionDefaultValue, collectionsInfo: { ...collectionDefaultValue.collectionsInfo, collections: { ['cid_1']: { id: 'cid_1', name: 'c1' } } } });
});

test('delete record', () => {

    let oldState = {
        ...collectionDefaultValue, collectionsInfo: {
            ...collectionDefaultValue.collectionsInfo, records: {
                ['cid_1']: {
                    ['rid_1']: { id: 'rid_1', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record },
                    ['rid_2']: { id: 'rid_2', collectionId: 'cid_1', name: 'r2', category: RecordCategory.folder },
                    ['rid_3']: { id: 'rid_3', pid: 'rid_2', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }
                }
            }
        }
    };

    let state = collectionState(oldState, actionCreator(DeleteRecordType, { id: 'rid_1', collectionId: 'cid_1', category: RecordCategory.record }));

    let expectState1 = {
        ...collectionDefaultValue, collectionsInfo: {
            ...collectionDefaultValue.collectionsInfo, records: {
                ['cid_1']: {
                    ['rid_2']: { id: 'rid_2', collectionId: 'cid_1', name: 'r2', category: RecordCategory.folder },
                    ['rid_3']: { id: 'rid_3', pid: 'rid_2', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }
                }
            }
        }
    };
    expect(state).toEqual(expectState1);

    state = collectionState(oldState, actionCreator(DeleteRecordType, { id: 'rid_2', collectionId: 'cid_1', category: RecordCategory.folder }));

    let expectState2 = {
        ...collectionDefaultValue, collectionsInfo: {
            ...collectionDefaultValue.collectionsInfo, records: {
                ['cid_1']: {
                    ['rid_1']: { id: 'rid_1', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }
                }
            }
        }
    };
    expect(state).toEqual(expectState2);
});

test('delete collection', () => {

    let oldState = {
        ...collectionDefaultValue, collectionsInfo: {
            ...collectionDefaultValue.collectionsInfo, collections: { ['cid_1']: { id: 'cid_1', name: 'c1', projectId: 'pid', description: '' }, ['cid_2']: { id: 'cid_2', name: 'c2', projectId: 'pid', description: '' } }, records: {
                ['cid_1']: {
                    ['rid_2']: { id: 'rid_2', collectionId: 'cid_1', name: 'r2', category: RecordCategory.folder },
                    ['rid_3']: { id: 'rid_3', pid: 'rid_2', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }
                },
                ['cid_2']: {
                    ['rid_1']: { id: 'rid_1', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }
                }
            }
        }
    };

    let state = collectionState(oldState, actionCreator(DeleteCollectionType, 'cid_1'));

    expect(state).toEqual({
        ...collectionDefaultValue, collectionsInfo: {
            ...collectionDefaultValue.collectionsInfo,
            collections: { ['cid_2']: { id: 'cid_2', name: 'c2', projectId: 'pid', description: '' } },
            records: {
                ['cid_2']: {
                    ['rid_1']: { id: 'rid_1', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }
                }
            }
        }
    });
});