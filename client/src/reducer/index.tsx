import { combineEpics } from 'redux-observable';
import { fetchCollectionEpic } from '../actions/collections';
import { combineReducers } from 'redux';
import { collections } from './collections';

export const rootEpic = combineEpics(
    fetchCollectionEpic
);

export const rootReducer = combineReducers({
    collections
})