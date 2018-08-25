import { allProject } from '../misc/constants';
import * as _ from 'lodash';

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