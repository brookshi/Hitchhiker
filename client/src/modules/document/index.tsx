import React from 'react';
import { connect, Dispatch, MapStateToPropsFactory } from 'react-redux';
import { State } from '../../state/index';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { getDisplayCollectionSelector } from '../collection/collection_tree/selector';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import * as _ from 'lodash';
import { DtoHeader } from '../../../../api/interfaces/dto_header';

interface ApiDocumentStateProps {

    collections: DtoCollection[];

    records: _.Dictionary<_.Dictionary<DtoRecord>>;
}

interface ApiDocumentDispatchProps { }

type ApiDocumentProps = ApiDocumentStateProps & ApiDocumentDispatchProps;

interface ApiDocumentState { }

class ApiDocument extends React.Component<ApiDocumentProps, ApiDocumentState> {

    private renderHeaders = (headers: DtoHeader[]) => {
        return (
            <div>
                {
                    headers.map(h => (
                        <div>
                            <span>{h.key}</span>
                            <span>{h.value}</span>
                            <span>{h.description}</span>
                        </div>
                    ))
                }
            </div>
        );
    }

    public render() {
        const records = _.sortBy(_.values(this.props.records[this.props.collections[0].id]), r => r.name);
        return (
            <div>
                {
                    records.map(r => (
                        <div>
                            <div>{r.name || ''}</div>
                            <div>{r.description || ''}</div>
                            <div>{r.url || ''}</div>
                            <div>{(this.renderHeaders(r.queryStrings || []))}</div>
                            <div>{(this.renderHeaders(r.headers || []))}</div>
                            <div>{r.body || ''}</div>
                        </div>
                    ))
                }
            </div>
        );
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any> = (initialState: any, ownProps: any) => {
    const getCollections = getDisplayCollectionSelector();

    const mapStateToProps: (state: State) => ApiDocumentStateProps = state => {
        const { collectionsInfo } = state.collectionState;

        return {
            collections: getCollections(state),
            records: collectionsInfo.records,
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ApiDocumentDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(ApiDocument);