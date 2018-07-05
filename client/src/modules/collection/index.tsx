import React from 'react';
import { connect, Dispatch } from 'react-redux';
import CollectionList from '../../components/collection_tree';
import ReqResPanel from './req_res_panel';
import PerfectScrollbar from 'react-perfect-scrollbar';
import SiderLayout from '../../components/sider_layout';

interface CollectionStateProps { }

interface CollectionDispatchProps { }

type CollectionProps = CollectionStateProps & CollectionDispatchProps;

interface CollectionState { }

class Collection extends React.Component<CollectionProps, CollectionState> {

    public render() {
        return (
            <SiderLayout
                sider={<CollectionList />}
                content={(
                    <div style={{ marginTop: 4 }}>
                        <PerfectScrollbar>
                            <ReqResPanel />
                        </PerfectScrollbar>
                    </div>
                )}
            />
        );
    }
}

const mapStateToProps = (state: any): CollectionStateProps => {
    return {};
};

const mapDispatchToProps = (dispatch: Dispatch<any>): CollectionDispatchProps => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Collection);