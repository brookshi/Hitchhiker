
test('resize left panel', () => {
    const rootReducer = require('../index');
    const defaultState = require('../../state/index');
    let state = rootReducer({ ...defaultState, uiState: { ...defaultState.uiState, appUIState: { ...defaultState.uiState.appUIState, leftPanelWidth: 300 } } }, { type: 'resize left panel', value: 318 });
    expect(state).toEqual({ ...defaultState, uiState: { ...defaultState.uiState, appUIState: { ...defaultState.uiState.appUIState, leftPanelWidth: 318 } } });
});