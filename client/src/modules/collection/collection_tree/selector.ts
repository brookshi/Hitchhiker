import { createSelector } from 'reselect';
import { State } from '../../../state';
import * as _ from 'lodash';
import { DtoProject } from '../../../../../api/interfaces/dto_project';
import { allProject } from '../../../common/constants';
import { DtoCollection } from '../../../../../api/interfaces/dto_collection';

const getProjects = (state: State) => state.projectState.projects;

const getSelectedProject = (state: State) => state.collectionState.selectedProject;

const getCollections = (state: State) => state.collectionState.collectionsInfo.collections;

const getUserId = (state: State) => state.userState.userInfo.id;

const getOpenKeys = (state: State) => state.collectionState.openKeys;

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

export const getOpenKeysSelector = () => {
    return createSelector(
        [getSelectedProject, getOpenKeys, getCollections],
        (selectedProject, openKeys, collections) => {

            if (selectedProject === allProject) {
                return openKeys;
            }
            return _.filter(openKeys, k => collections[k] && collections[k].projectId === selectedProject);
        }
    );
};

export const getDisplayCollectionSelector = () => {
    return createSelector(
        [getSelectedProject, getCollections],
        (selectedProject, collections) => {
            const sortCollections = _.chain(collections).values<DtoCollection>().sortBy('name').value();
            if (selectedProject === allProject) {
                return sortCollections;
            }
            return _.filter(sortCollections, c => c.projectId === selectedProject);
        }
    );
};