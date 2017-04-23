import { combineEpics } from 'redux-observable';
import { fetchCollectionEpic } from '../actions/collections';
import { collections } from './collections';
import { combineReducers } from 'redux';

export const rootEpic = combineEpics(
    fetchCollectionEpic
);

export const rootReducer = combineReducers({
    collections: collections
})