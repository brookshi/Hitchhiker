import { defaultState } from '../../state/index';
import { ResizeLeftPanelType, UpdateLeftPanelType } from '../../action/ui';
import { actionCreator, SyncType, SyncSuccessType } from '../../action/index';
import { EditEnvType } from '../../action/project';
import { uiState } from '../ui';
import { uiDefaultValue } from '../../state/ui';

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

    let state = uiState(uiDefaultValue, actionCreator(SyncType, { type: 'sync', url: 'url', method: 'GET' }));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 1, message: undefined, syncItems: [{ type: 'sync', url: 'url', method: 'GET' }] } });

    state = uiState(state, actionCreator(SyncType, { type: 'sync2', url: 'url2', method: 'POST' }));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 2, message: undefined, syncItems: [{ type: 'sync', url: 'url', method: 'GET' }, { type: 'sync2', url: 'url2', method: 'POST' }] } });
});

test('sync success', () => {

    let oldState = { ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 2, message: undefined, syncItems: [{ type: 'sync', url: 'url', method: 'GET' }, { type: 'sync2', url: 'url2', method: 'POST' }] } };

    let state = uiState(oldState, actionCreator(SyncSuccessType));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 1, message: undefined, syncItems: [{ type: 'sync2', url: 'url2', method: 'POST' }] } });

    state = uiState(state, actionCreator(SyncSuccessType));

    expect(state).toEqual({ ...uiDefaultValue, syncState: { ...defaultState.uiState.syncState, syncCount: 0, message: undefined, syncItems: [] } });
});