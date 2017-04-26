import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Menu } from 'antd';
import { DtoResCollection, DtoResRecord } from '../../../../api/interfaces/dto_res';
import { fetchCollection } from '../../actions/collections';
import { State } from '../../state';
import RecordFolder from './record_folder';
import RecordItem from './record_item';
import CollectionItem from './collection_item';
import './collection_tree/index.less';

interface CollectionListStateProps {
    collections: DtoResCollection[];
}

interface CollectionListDispatchProps {
    refresh: Function;
}

type CollectionListProps = CollectionListStateProps & CollectionListDispatchProps;

interface CollectionListState {
    openKeys: string[];
}

class CollectionList extends React.Component<CollectionListProps, CollectionListState> {
    refresh: Function;

    constructor(props: CollectionListProps) {
        super(props);
        this.refresh = props.refresh;
        this.state = {
            openKeys: [],
        };
    }

    componentWillMount() {
        this.refresh();
    }

    onOpenChanged = (openKeys: string[]) => {
        this.setState({ openKeys: openKeys });
    }

    render() {
        const { collections } = this.props;

        const loopRecords = (data: DtoResRecord[]) => data.map(r => {
            if (r.children && r.children.length) {
                return (
                    <RecordFolder
                        record={r}
                        isOpen={this.state.openKeys.indexOf(r.id) > -1}
                        children={loopRecords(r.children)} />
                );
            }
            return (
                <RecordItem record={r} />
            );
        });

        return (
            <Menu
                className="collection-tree"
                style={{ width: 300 }}
                onOpenChange={this.onOpenChanged}
                mode="inline"
                inlineIndent={0}
            >
                {
                    collections.map(c => {
                        return (
                            <CollectionItem collection={c} children={loopRecords(c.records)} />
                        );
                    })
                }
            </Menu>
        );
    }
}

const mapStateToProps = (state: State): CollectionListStateProps => {
    return {
        collections: state.collections
    };
};

const mapDispatchToProps = (dispatch: Dispatch<{}>): CollectionListDispatchProps => {
    return {
        refresh: () => dispatch(fetchCollection())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CollectionList);