export interface AppUIState {

    activeModule: string;

    leftPanelWidth: number;

    collapsed: boolean;
}

export interface ReqResUIState {

    isReqPanelHidden: boolean;

    resHeight: number;

    activeResTab: string;

    activeReqTab: string;
}

export interface UIState {

    appUIState: AppUIState;

    reqResUIState: _.Dictionary<ReqResUIState>;
}

export const appUIDefaultValue = {
    activeModule: 'collection',
    leftPanelWidth: 300,
    collapsed: false
};

export const reqResUIDefaultValue = {
    isReqPanelHidden: false,
    activeResTab: 'content',
    activeReqTab: 'headers',
    resHeights: 0
};

export const uiDefaultValue = {
    appUIState: appUIDefaultValue,
    reqResUIState: {}
};