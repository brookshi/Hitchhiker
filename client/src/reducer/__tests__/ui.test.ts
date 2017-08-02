import { rootReducer } from '../index';
import { defaultState } from '../../state/index';
import { ResizeLeftPanelType, UpdateLeftPanelType } from '../../action/ui';
import { actionCreator } from '../../action/index';

test('resize left panel', () => {

    let oldState = { ...defaultState, uiState: { ...defaultState.uiState, appUIState: { ...defaultState.uiState.appUIState, leftPanelWidth: 300 } } };

    let state = rootReducer(oldState, { type: ResizeLeftPanelType, value: 318 });

    expect(state).toEqual({ ...defaultState, uiState: { ...defaultState.uiState, appUIState: { ...defaultState.uiState.appUIState, leftPanelWidth: 318 } } });
});

test('active module', () => {

    let state = rootReducer(defaultState, actionCreator(UpdateLeftPanelType, { collapsed: true, activeModule: 'project' }));

    expect(state).toEqual({ ...defaultState, uiState: { ...defaultState.uiState, appUIState: { ...defaultState.uiState.appUIState, collapsed: true, activeModule: 'project' } } });

    state = rootReducer(defaultState, actionCreator(UpdateLeftPanelType, { collapsed: false, activeModule: 'schedule' }));

    expect(state).toEqual({ ...defaultState, uiState: { ...defaultState.uiState, appUIState: { ...defaultState.uiState.appUIState, collapsed: false, activeModule: 'schedule' } } });
});