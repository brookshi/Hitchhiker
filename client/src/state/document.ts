import { allProject } from '../common/constants';

export interface DocumentState {

    documentActiveRecord: string;

    activeEnv: _.Dictionary<string>;

    documentCollectionOpenKeys: string[];

    documentSelectedProject: string;

    scrollTop: number;

    changeByScroll: boolean;
}

export const documentDefaultValue: DocumentState = {
    documentActiveRecord: '',
    documentCollectionOpenKeys: [],
    activeEnv: {},
    documentSelectedProject: allProject,
    scrollTop: 0,
    changeByScroll: false
};