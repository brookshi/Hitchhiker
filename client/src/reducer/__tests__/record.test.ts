import { displayRecordsDefaultValue } from '../../state/collection';
import { activeKey, recordsOrder } from '../collection';
import { actionCreator } from '../../action/index';
import { ActiveTabType, ActiveRecordType, SaveRecordType } from '../../action/record';
import { newRecordFlag } from '../../common/constants';

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