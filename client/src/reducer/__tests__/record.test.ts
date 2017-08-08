import { displayRecordsDefaultValue } from '../../state/collection';
import { activeKey, recordsOrder, recordStates } from '../collection';
import { actionCreator } from '../../action/index';
import { ActiveTabType, ActiveRecordType, SaveRecordType, SendRequestType, MoveRecordType, CancelRequestType } from '../../action/record';
import { newRecordFlag } from '../../common/constants';
import { RecordCategory } from "../../common/record_category";

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

test('send request', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: false } };

    expect(recordStates(oldState, actionCreator(SendRequestType, { record: { id: '123' } }))).toEqual({ ...oldState, ['123']: { ...oldState['123'], isRequesting: true } });
});

test('save record', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: true } };

    expect(recordStates(oldState, actionCreator(SaveRecordType, { isNew: false, oldId: '123', record: { id: '123', collectionId: 'cid_1', name: 'r2', category: RecordCategory.record } }))).toEqual({ ...oldState, ['123']: { ...oldState['123'], record: { ...oldState['123'].record, name: 'r2' }, name: 'r2', isChanged: false } });

    oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: true } };

    expect(recordStates(oldState, actionCreator(SaveRecordType, { isNew: true, oldId: '123', record: { id: '456', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record } }))).toEqual({ ...displayRecordsDefaultValue.recordStates, ['456']: { ...oldState['456'], record: { id: '456', collectionId: 'cid_1', name: 'r3', category: RecordCategory.record }, name: 'r3', isChanged: false, isRequesting: false } });
});

test('move record', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: false, name: 'r1', isChanged: false } };

    expect(recordStates(oldState, actionCreator(MoveRecordType, { record: { id: '123', pid: 'pid_123', collectionId: 'cid_456', name: 'r1', category: RecordCategory.record } }))).toEqual({ ...oldState, ['123']: { ...oldState['123'], record: { ...oldState['123'].record, pid: 'pid_123', collectionId: 'cid_456' } } });
});

test('cancel request', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false } };

    expect(recordStates(oldState, actionCreator(CancelRequestType, '123'))).toEqual({ ...oldState, ['123']: { ...oldState['123'], isRequesting: false } });
});

test('active record', () => {

    let oldState = { ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1', category: RecordCategory.record }, isRequesting: true, name: 'r1', isChanged: false } };

    expect(recordStates(oldState, actionCreator(ActiveRecordType, { id: '123', name: 'r1', collectionId: 'cid_1' }))).toEqual(oldState);

    expect(recordStates(displayRecordsDefaultValue.recordStates, actionCreator(ActiveRecordType, { id: '123', name: 'r1', collectionId: 'cid_1' }))).toEqual({ ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collectionId: 'cid_1', name: 'r1' }, isRequesting: false, name: 'r1', isChanged: false } });

    expect(recordStates(displayRecordsDefaultValue.recordStates, actionCreator(ActiveRecordType, { id: '123', name: 'r1', collection: { id: 'cid_1' } }))).toEqual({ ...displayRecordsDefaultValue.recordStates, ['123']: { record: { id: '123', collection: { id: 'cid_1' }, collectionId: 'cid_1', name: 'r1' }, isRequesting: false, name: 'r1', isChanged: false } });
});