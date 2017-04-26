import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Menu } from 'antd';
import { DtoResCollection, DtoResRecord } from '../../../../api/interfaces/dto_res';
import { fetchCollection } from '../../actions/collections';
import { State } from '../../state';
import RecordFolder from './record_folder';
import RecordItem from './record_item';
import CollectionItem from './collection_item';
import './style/index.less';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

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
                const isOpen = this.state.openKeys.indexOf(r.id) > -1;
                return (
                    <SubMenu key={r.id} title={<RecordFolder name={r.name} isOpen={isOpen} />}>
                        {loopRecords(r.children)}
                    </SubMenu>
                );
            }
            return (
                <MenuItem key={r.id} style={{ height: 30, 'line-height': 30 }}>
                    {<RecordItem name={r.name} url={r.url} method={r.method} />}
                </MenuItem>
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
                            <SubMenu className="collection-item" key={c.id} title={<CollectionItem name={c.name} />}>
                                {loopRecords(c.records)}
                            </SubMenu>
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