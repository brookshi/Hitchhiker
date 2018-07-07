import React from 'react';
import { connect, Dispatch } from 'react-redux';
import CollectionList from '../../components/collection_tree';
import ReqResPanel from './req_res_panel';
import PerfectScrollbar from 'react-perfect-scrollbar';
import SiderLayout from '../../components/sider_layout';
import { ActiveRecordType } from '../../action/record';
import { CollectionOpenKeysType, SelectedProjectChangedType } from '../../action/collection';
import { State } from '../../state/index';

interface CollectionStateProps {

    activeKey: string;

    openKeys: string[];

    selectedProject: string;
}

interface CollectionDispatchProps { }

type CollectionProps = CollectionStateProps & CollectionDispatchProps;

interface CollectionState { }

class Collection extends React.Component<CollectionProps, CollectionState> {

    public render() {

        const { activeKey, openKeys, selectedProject } = this.props;

        return (
            <SiderLayout
                sider={
                    <CollectionList
                        readOnly={false}
                        activeKey={activeKey}
                        openKeys={openKeys}
                        selectedProject={selectedProject}
                        activeRecordType={ActiveRecordType}
                        collectionOpenKeysType={CollectionOpenKeysType}
                        selectedProjectChangedType={SelectedProjectChangedType}
                    />
                }
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

const mapStateToProps = (state: State): CollectionStateProps => {
    return {
        activeKey: state.displayRecordsState.activeKey,
        openKeys: state.collectionState.openKeys,
        selectedProject: state.collectionState.selectedProject
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): CollectionDispatchProps => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Collection);