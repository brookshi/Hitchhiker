import { createSelector } from 'reselect';
import { State } from '../../state';
import * as _ from 'lodash';
import { DtoProject } from '../../../../api/src/interfaces/dto_project';
import { allProject } from '../../common/constants';
import { DtoCollection } from '../../../../api/src/interfaces/dto_collection';

const getProjects = (state: State) => state.projectState.projects;

const getSelectedProject = (state: State) => state.collectionState.selectedProject;

const getDocumentSelectedProject = (state: State) => state.documentState.documentSelectedProject;

const getCollections = (state: State) => state.collectionState.collectionsInfo.collections;

const getUserId = (state: State) => state.userState.userInfo.id;

export const getProjectsIdNameStateSelector = () => {
    return createSelector(
        [getProjects, getUserId],
        (projects, userId) => {
            return _.chain(projects)
                .values<DtoProject>()
                .sortBy('name')
                .sortBy(t => t.owner.id !== userId)
                .sortBy(t => t.isMe ? 0 : 1)
                .value()
                .map(t => ({ id: t.id ? t.id : '', name: t.name ? t.name : '' }));
        }
    );
};

export const getDisplayCollectionSelectorForProject = (state: State) => {
    return projectId => {
        const collections = getCollections(state);
        const sortCollections = _.chain(collections).values<DtoCollection>().sortBy('name').value();
        if (projectId === allProject) {
            return sortCollections;
        }
        return _.filter(sortCollections, c => c.projectId === projectId);
    };
};

export const getDisplayCollectionSelector = () => {
    return createSelector(
        [getSelectedProject, getDisplayCollectionSelectorForProject],
        (selectedProject, getProjectCollections) => getProjectCollections(selectedProject)
    );
};

export const getDocumentDisplayCollectionSelector = () => {
    return createSelector(
        [getDocumentSelectedProject, getDisplayCollectionSelectorForProject],
        (selectedProject, getProjectCollections) => getProjectCollections(selectedProject)
    );
};