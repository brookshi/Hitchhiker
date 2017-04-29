import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Menu } from 'antd';
import { DtoResCollection, DtoResRecord } from '../../../../api/interfaces/dto_res';
import { fetchCollection } from './action';
import { State } from '../../state';
import RecordFolder from './record_folder';
import RecordItem from './record_item';
import CollectionItem from './collection_item';
import './style/index.less';
import { activeTabAction } from '../req_res_panel/action';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { SelectParam } from 'antd/lib/menu';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

interface CollectionListStateProps {
    collections: DtoResCollection[];
    activeKey: string;
}

interface CollectionListDispatchProps {
    refresh: Function;
    activeRecord: (record: DtoRecord | DtoResRecord) => void;
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

    onSelectChanged = (param: SelectParam) => {
        this.props.activeRecord(param.item.props.data);
    }

    render() {
        const { collections, activeKey } = this.props;
        const recordStyle = { height: 30, 'line-height': 30 };

        const loopRecords = (data: DtoResRecord[], inFolder: boolean = false) => data.map(r => {
            if (r.children && r.children.length) {
                const isOpen = this.state.openKeys.indexOf(r.id) > -1;
                return (
                    <SubMenu className="folder" key={r.id} title={<RecordFolder name={r.name} isOpen={isOpen} />}>
                        {loopRecords(r.children, true)}
                    </SubMenu>
                );
            }
            return (
                <MenuItem key={r.id} style={recordStyle} data={r}>
                    {<RecordItem name={r.name} url={r.url} method={r.method} inFolder={inFolder} />}
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
                selectedKeys={[activeKey]}
                onSelect={this.onSelectChanged}
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
    return state.collectionsState;
};

const mapDispatchToProps = (dispatch: Dispatch<{}>): CollectionListDispatchProps => {
    return {
        refresh: () => dispatch(fetchCollection()),
        activeRecord: (key) => dispatch(activeTabAction(key))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CollectionList);