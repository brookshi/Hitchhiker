import { displayRecordsDefaultValue } from '../../state/collection';
import { activeKey, recordsOrder, recordStates, recordWithResState } from '../collection';
import { actionCreator } from '../../action/index';
import { ActiveTabType, ActiveRecordType, SaveRecordType, SendRequestType, MoveRecordType, CancelRequestType, AddTabType, RemoveTabType, DeleteRecordType, SendRequestFulfilledType } from '../../action/record';
import { newRecordFlag } from '../../common/constants';
import { RecordCategory } from '../../common/record_category';
import * as _ from 'lodash';
import { DeleteCollectionType } from '../../action/collection';
import { defaultRunResult } from "./data";

test('key - active tab', () => {

    expect(activeKey(displayRecordsDefaultValue.activeKey, actionCreator(ActiveTabType, '123'))).toEqual('123');
});

test('key - active record', () => {

    expect(activeKey(displayRecordsDefaultValue.activeKey, actionCreator(ActiveRecordType, { id: '123' }))).toEqual('123');
});

test('key - save record', () => {

    expect(activeKey(displayRecordsDefaultValue.activeKey, actionCreator(SaveRecordType, { isNew: true, oldId: '123', record: { id: '456' } }))).toEqual('456');

    expect(activeKey(displayRecordsDefaultValue.activeKey, actionCreator(SaveRecordType, { isNew: true, oldId: '', record: { id: '456' } }))).toEqual(newRecordFlag);

    expect(activeKey(displayRecordsDefaultValue.activeKey, actionCreator(SaveRecordType, { isNew: false, oldId: '123', record: { id: '456' } }))).toEqual(newRecordFlag);
});

test('order - active record', () => {

    expect(recordsOrder([], actionCreator(ActiveRecordType, { id: '123' }))).toEqual(['123']);

    expect(recordsOrder(['123'], actionCreator(ActiveRecordType, { id: '123' }))).toEqual(['123']);

    expect(recordsOrder(['123'], actionCreator(ActiveRecordType, { id: '456' }))).toEqual(['123', '456']);
});

test('order - save record', () => {

    expect(recordsOrder(['123'], actionCreator(SaveRecordType, { isNew: false, oldId: '123', record: { id: '456' } }))).toEqual(['123']);

    expect(recordsOrder(['123'], actionCreator(SaveRecordType, { isNew: true, oldId: '123', record: { id: '456' } }))).toEqual(['456']);
});

test('record state - send request', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: false } };

    expect(recordStates(oldState, actionCreator(SendRequestType, { record: { id: '123' } }))).toEqual({ ...oldState, ['123']: { ...oldState['123'], isRequesting: true } });
});

test('record state - save record', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: true } };

    expect(recordStates(oldState, actionCreator(SaveRecordType, { isNew: false, oldId: '123', record: { id: '123', collectionId: 'cid_1', name: 'r2', category: RecordCategory.record } }))).toEqual({ ...oldState, ['123']: { ...oldState['123'], record: { ...oldState['123'].record, name: 'r2' }, name: 'r2', isChanged: false } });

    oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: true } };

    expect(recordStates(oldState, actionCreator(SaveRecordType, { isNew: true, oldId: '123', record: { id: '456', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record } }))).toEqual({ ...displayRecordsDefaultValue.recordStates, ['456']: { ...oldState['456'], record: { id: '456', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }, name: 'r3', isChanged: false, isRequesting: false } });
});

test('record state - move record', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: false } };

    expect(recordStates(oldState, actionCreator(MoveRecordType, { record: { id: '123', pid: 'pid_123', collectionId: 'cid_456', name: 'r1', category: RecordCategory.record } }))).toEqual({ ...oldState, ['123']: { ...oldState['123'], record: { ...oldState['123'].record, pid: 'pid_123', collectionId: 'cid_456' } } });
});

test('record state - cancel request', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false } };

    expect(recordStates(oldState, actionCreator(CancelRequestType, '123'))).toEqual({ ...oldState, ['123']: { ...oldState['123'], isRequesting: false } });
});

test('record state - active record', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false } };

    expect(recordStates(oldState, actionCreator(ActiveRecordType, { id: '123', name: 'r1', collectionId: 'cid_1' }))).toEqual(oldState);

    expect(recordStates(displayRecordsDefaultValue.recordStates, actionCreator(ActiveRecordType, { id: '123', name: 'r1', collectionId: 'cid_1' }))).toEqual({ ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1' }, isRequesting: false, name: 'r1', isChanged: false } });

    expect(recordStates(displayRecordsDefaultValue.recordStates, actionCreator(ActiveRecordType, { id: '123', name: 'r1', collection: { id: 'cid_1' } }))).toEqual({ ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collection: { id: 'cid_1' }, collectionId: 'cid_1', name: 'r1' }, isRequesting: false, name: 'r1', isChanged: false } });
});

test('record with res state - save record', () => {

    let oldState = { ...displayRecordsDefaultValue, responseState: { ['123']: defaultRunResult } };

    expect(recordWithResState(oldState, actionCreator(SaveRecordType, { isNew: false, oldId: '123', record: { id: '456' } }))).toEqual(oldState);

    expect(recordWithResState(oldState, actionCreator(SaveRecordType, { isNew: true, oldId: '', record: { id: '456' } }))).toEqual(oldState);

    expect(recordWithResState(oldState, actionCreator(SaveRecordType, { isNew: true, oldId: '123', record: { id: '456' } }))).toEqual({ ...oldState, responseState: { ['456']: defaultRunResult } });
});

test('record with res state - add tab', () => {

    let state = recordWithResState({ ...displayRecordsDefaultValue, recordStates: {}, recordsOrder: [] }, actionCreator(AddTabType));

    expect(_.keys(state.recordStates).length).toEqual(1);

    expect(state.recordsOrder.length).toEqual(1);

    expect(state.recordsOrder[0]).toEqual(_.keys(state.recordStates)[0]);

    expect(state.activeKey.length).toBeGreaterThan(1);
});

test('record with res state - remove tab', () => {

    let oldState = { ...displayRecordsDefaultValue, responseState: { ['123']: defaultRunResult } };

    expect(recordWithResState(oldState, actionCreator(RemoveTabType, '123'))).toEqual(displayRecordsDefaultValue);

    oldState = { ...displayRecordsDefaultValue, recordStates: { ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false } }, responseState: { ['123']: defaultRunResult }, activeKey: '123', recordsOrder: ['123'] };

    let state = recordWithResState(oldState, actionCreator(RemoveTabType, '123'));
    expect(_.keys(state.recordStates)[0] !== '123').toBeTruthy();
    expect(_.keys(state.recordStates)[0] === state.recordsOrder[0]).toBeTruthy();

    let oldStateWith3 = {
        ...displayRecordsDefaultValue, recordStates: {
            ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false },
            ['456']: { record: { id: '456', collectionId: 'cid_1', name: 'r2', category: RecordCategory.record }, isRequesting: true, name: 'r2', isChanged: false },
            ['789']: { record: { id: '789', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }, isRequesting: true, name: 'r3', isChanged: false }
        },
        recordsOrder: ['123', '456', '789'],
        responseState: { ['123']: defaultRunResult, ['456']: { ...defaultRunResult, id: '456' }, ['789']: { ...defaultRunResult, id: '789' } },
        activeKey: '123'
    };

    expect(recordWithResState(oldStateWith3, actionCreator(RemoveTabType, '456'))).toEqual({
        ...displayRecordsDefaultValue, recordStates: {
            ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false },
            ['789']: { record: { id: '789', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }, isRequesting: true, name: 'r3', isChanged: false }
        },
        responseState: { ['123']: defaultRunResult, ['789']: { ...defaultRunResult, id: '789' } },
        recordsOrder: ['123', '789'],
        activeKey: '123'
    });

    expect(recordWithResState(oldStateWith3, actionCreator(RemoveTabType, '123'))).toEqual({
        ...displayRecordsDefaultValue, recordStates: {
            ['456']: { record: { id: '456', collectionId: 'cid_1', name: 'r2', category: RecordCategory.record }, isRequesting: true, name: 'r2', isChanged: false },
            ['789']: { record: { id: '789', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }, isRequesting: true, name: 'r3', isChanged: false }
        },
        responseState: { ['456']: { ...defaultRunResult, id: '456' }, ['789']: { ...defaultRunResult, id: '789' } },
        recordsOrder: ['456', '789'],
        activeKey: '456'
    });

    expect(recordWithResState({ ...oldStateWith3, activeKey: '456' }, actionCreator(RemoveTabType, '456'))).toEqual({
        ...displayRecordsDefaultValue, recordStates: {
            ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false },
            ['789']: { record: { id: '789', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }, isRequesting: true, name: 'r3', isChanged: false }
        },
        responseState: { ['123']: defaultRunResult, ['789']: { ...defaultRunResult, id: '789' } },
        recordsOrder: ['123', '789'],
        activeKey: '789'
    });

    expect(recordWithResState({ ...oldStateWith3, activeKey: '789' }, actionCreator(RemoveTabType, '789'))).toEqual({
        ...displayRecordsDefaultValue, recordStates: {
            ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false },
            ['456']: { record: { id: '456', collectionId: 'cid_1', name: 'r2', category: RecordCategory.record }, isRequesting: true, name: 'r2', isChanged: false }
        },
        responseState: { ['123']: defaultRunResult, ['456']: { ...defaultRunResult, id: '456' } },
        recordsOrder: ['123', '456'],
        activeKey: '456'
    });

});

test('record with res state - send request fulfill', () => {

    let oldState = { ...displayRecordsDefaultValue, recordStates: { ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false } } };

    expect(recordWithResState(oldState, actionCreator(SendRequestFulfilledType, { id: '123', runResult: defaultRunResult }))).toEqual({ ...displayRecordsDefaultValue, recordStates: { ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: false } }, responseState: { ['123']: defaultRunResult } });
});

test('record with res state - delete record', () => {

    let oldState = { ...displayRecordsDefaultValue, recordStates: { ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false }, ['456']: { record: { id: '456', collectionId: 'cid_1', name: 'r2', category: RecordCategory.record }, isRequesting: true, name: 'r2', isChanged: false } }, recordsOrder: ['123', '456'], activeKey: '123' };

    let targetstate = { ...displayRecordsDefaultValue, recordStates: { ['456']: { record: { id: '456', collectionId: 'cid_1', name: 'r2', category: RecordCategory.record }, isRequesting: true, name: 'r2', isChanged: false } }, recordsOrder: ['456'], activeKey: '456' };

    expect(recordWithResState(oldState, actionCreator(DeleteRecordType, { id: '123' }))).toEqual(targetstate);

    let newTargetstate = recordWithResState(targetstate, actionCreator(DeleteRecordType, { id: '456' }));

    expect(_.keys(newTargetstate.recordStates).length).toEqual(1);

    expect(newTargetstate.recordsOrder.length).toEqual(1);

    expect(newTargetstate.recordsOrder[0]).toEqual(_.keys(newTargetstate.recordStates)[0]);
});

test('record with res state - delete collection', () => {

    let oldState = { ...displayRecordsDefaultValue, recordStates: { ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false }, ['456']: { record: { id: '456', collectionId: 'cid_2', name: 'r2', category: RecordCategory.record }, isRequesting: true, name: 'r2', isChanged: false } }, recordsOrder: ['123', '456'], activeKey: '123' };

    let targetstate = { ...displayRecordsDefaultValue, recordStates: { ['456']: { record: { id: '456', collectionId: 'cid_2', name: 'r2', category: RecordCategory.record }, isRequesting: true, name: 'r2', isChanged: false } }, recordsOrder: ['456'], activeKey: '456' };

    expect(recordWithResState(oldState, actionCreator(DeleteCollectionType, 'cid_1'))).toEqual(targetstate);

    let newTargetstate = recordWithResState(targetstate, actionCreator(DeleteCollectionType, 'cid_2'));

    expect(_.keys(newTargetstate.recordStates).length).toEqual(1);

    expect(newTargetstate.recordsOrder.length).toEqual(1);

    expect(newTargetstate.recordsOrder[0]).toEqual(_.keys(newTargetstate.recordStates)[0]);
});