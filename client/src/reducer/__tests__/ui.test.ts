import { defaultState } from '../../state/index';
import { ResizeLeftPanelType, UpdateLeftPanelType, SelectReqTabType, SelectResTabType, ToggleReqPanelVisibleType, ResizeResHeightType, SwitchHeadersEditModeType } from '../../action/ui';
import { actionCreator, SyncType, SyncSuccessType, SyncRetryType, SyncFailedType, ResetSyncMsgType, syncAction } from '../../action/index';
import { EditEnvType } from '../../action/project';
import { uiState } from '../ui';
import { uiDefaultValue, reqResUIDefaultValue } from '../../state/ui';
import { RemoveTabType, SaveRecordType } from '../../action/record';
import { KeyValueEditType } from '../../common/custom_type';

test('resize left panel', () => {

    expect(uiDefaultValue).toEqual({ ...uiDefaultValue, appUIState: { ...uiDefaultValue.appUIState, leftPanelWidth: 300 } });

    let state = uiState({ ...uiDefaultValue, appUIState: { ...uiDefaultValue.appUIState, leftPanelWidth: 200 } }, { type: ResizeLeftPanelType, value: 318 });

    expect(state).toEqual({ ...uiDefaultValue, appUIState: { ...uiDefaultValue.appUIState, leftPanelWidth: 318 } });
});

test('active module', () => {

    let state = uiState(uiDefaultValue, actionCreator(UpdateLeftPanelType, { collapsed: true, activeModule: 'project' }));

    expect(state).toEqual({ ...uiDefaultValue, appUIState: { ...defaultState.uiState.appUIState, collapsed: true, activeModule: 'project' } });

    state = uiState(uiDefaultValue, actionCreator(UpdateLeftPanelType, { collapsed: false, activeModule: 'schedule' }));

    expect(state).toEqual({ ...uiDefaultValue, appUIState: { ...defaultState.uiState.appUIState, collapsed: false, activeModule: 'schedule' } });
});

test('click edit environment button', () => {

    let state = uiState(uiDefaultValue, actionCreator(EditEnvType));

    expect(state).toEqual({ ...uiDefaultValue, appUIState: { ...defaultState.uiState.appUIState, activeModule: 'project' } });
});

test('sync', () => {

    let state = uiState(uiDefaultValue, syncAction({ type: 'sync', url: 'url', method: 'GET' }));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 1, message: undefined, syncItems: [{ type: 'sync', url: 'url', method: 'GET' }] } });

    state = uiState(state, syncAction({ type: 'sync2', url: 'url2', method: 'POST' }));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 2, message: undefined, syncItems: [{ type: 'sync', url: 'url', method: 'GET' }, { type: 'sync2', url: 'url2', method: 'POST' }] } });
});

test('sync success', () => {

    let oldState = { ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 2, message: undefined, syncItems: [{ type: 'sync', url: 'url', method: 'GET' }, { type: 'sync2', url: 'url2', method: 'POST' }] } };

    let state = uiState(oldState, actionCreator(SyncSuccessType));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 1, message: undefined, syncItems: [{ type: 'sync2', url: 'url2', method: 'POST' }] } });

    state = uiState(state, actionCreator(SyncSuccessType));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 0, message: undefined, syncItems: [] } });
});

test('sync retry', () => {

    let oldState = { ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, message: undefined } };

    let state = uiState(oldState, actionCreator(SyncRetryType, { errMsg: 'error msg', delay: 100, time: 2, syncItem: { type: 'sync2', url: 'url2', method: 'POST' } }));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, message: `sync2 failed, error msg, Retry 2th time after 100s` } });
});

test('sync retry', () => {

    let oldState = { ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 2, message: undefined } };

    let state = uiState(oldState, actionCreator(SyncFailedType, 'sync failed'));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 1, message: `sync failed` } });
});

test('reset message', () => {

    let oldState = { ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, message: 'sync msg' } };

    let state = uiState(oldState, actionCreator(ResetSyncMsgType));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, message: undefined } });
});

test('select request option tab', () => {

    let oldState = { ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, activeReqTab: 'Headers' } } };

    let state = uiState(oldState, actionCreator(SelectReqTabType, { recordId: '123', tab: 'Body' }));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, activeReqTab: 'Body' } } });
});

test('select response option tab', () => {

    let oldState = { ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, activeResTab: 'Content' } } };

    let state = uiState(oldState, actionCreator(SelectResTabType, { recordId: '123', tab: 'Cookie' }));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, activeResTab: 'Cookie' } } });
});

test('toggle response panel max', () => {

    let oldState = { ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, isResPanelMaximum: false } } };

    let state = uiState(oldState, actionCreator(ToggleReqPanelVisibleType, { recordId: '123', visible: true }));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, isResPanelMaximum: true } } });
});

test('remove request tab', () => {

    let oldState = { ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue } } };

    let state = uiState(oldState, actionCreator(RemoveTabType, '123'));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState } });
});

test('switch request header edit mode', () => {

    let oldState = { ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, headersEditMode: KeyValueEditType.keyValueEdit } } };

    let state = uiState(oldState, actionCreator(SwitchHeadersEditModeType, { recordId: '123', mode: KeyValueEditType.bulkEdit }));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, headersEditMode: KeyValueEditType.bulkEdit } } });
});

test('resize response panel height', () => {

    let oldState = { ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, resHeight: 100 } } };

    let state = uiState(oldState, actionCreator(ResizeResHeightType, { recordId: '123', height: 200 }));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, resHeight: 200 } } });
});

test('save request', () => {

    let oldState = { ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, isResPanelMaximum: true } } };

    let state = uiState(oldState, actionCreator(SaveRecordType, { isNew: false, oldId: '123', record: { id: '456' } }));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, isResPanelMaximum: true } } });

    state = uiState(oldState, actionCreator(SaveRecordType, { isNew: true, oldId: '', record: { id: '456' } }));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['123']: { ...reqResUIDefaultValue, isResPanelMaximum: true } } });

    state = uiState(oldState, actionCreator(SaveRecordType, { isNew: true, oldId: '123', record: { id: '456' } }));

    expect(state).toEqual({ ...uiDefaultValue, reqResUIState: { ...uiDefaultValue.reqResUIState, ['456']: { ...reqResUIDefaultValue, isResPanelMaximum: true } } });
});