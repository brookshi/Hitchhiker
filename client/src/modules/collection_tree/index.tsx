import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Menu } from 'antd';
import { refreshCollectionAction, activeRecordAction, DeleteRecordType, DeleteCollectionType, UpdateCollectionType, CreateCollectionType, SaveCollectionType } from './action';
import { State } from '../../state';
import RecordFolder from './record_folder';
import RecordItem from './record_item';
import CollectionItem from './collection_item';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { SelectParam } from 'antd/lib/menu';
import * as _ from 'lodash';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { RecordCategory } from '../../common/record_category';
import './style/index.less';
import { actionCreator } from '../../action';
import { removeTabAction, SaveRecordType } from '../req_res_panel/action';
import { StringUtil } from '../../utils/string_util';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

interface CollectionListStateProps {
    collections: _.Dictionary<DtoCollection>;
    records: _.Dictionary<_.Dictionary<DtoRecord>>;
    activeKey: string;
}

interface CollectionListDispatchProps {
    refresh: Function;

    activeRecord: (record: DtoRecord) => void;

    deleteRecord(id: string, records: _.Dictionary<DtoRecord>);

    deleteCollection(id: string);

    updateCollection(collection: DtoCollection);

    createCollection(collection: DtoCollection);

    changeFolderName(record: DtoRecord, name: string);

    changeCollectionName(collection: DtoCollection, name: string);

    duplicateRecord(record: DtoRecord);

    createFolder(record: DtoRecord);
}

type CollectionListProps = CollectionListStateProps & CollectionListDispatchProps;

interface CollectionListState {
    openKeys: string[];
}

class CollectionList extends React.Component<CollectionListProps, CollectionListState> {

    currentNewFolder: DtoRecord | undefined;
    currentNewCollectionId: string;
    folderRefs: _.Dictionary<RecordFolder> = {};

    constructor(props: CollectionListProps) {
        super(props);
        this.state = {
            openKeys: [],
        };
    }

    componentWillMount() {
        this.props.refresh();
    }

    onOpenChanged = (openKeys: string[]) => {
        this.setState({ openKeys: openKeys });
    }

    onSelectChanged = (param: SelectParam) => {
        this.props.activeRecord(param.item.props.data);
    }

    createFolder = (folder: DtoRecord) => {
        this.props.createFolder(folder);
        this.currentNewFolder = folder;
    }

    changeFolderName = (folder: DtoRecord, name: string) => {
        this.props.changeFolderName(folder, name.trim() === '' ? folder.name : name)
    }

    componentWillReceiveProps(nextProps: CollectionListProps) {
        const openKeys = this.state.openKeys;
        if (this.currentNewFolder &&
            this.currentNewFolder.collectionId &&
            openKeys.indexOf(this.currentNewFolder.collectionId) < 0) {
            this.setState({ ...this.state, openKeys: [...openKeys, this.currentNewFolder.collectionId] });
        }
    }

    componentDidUpdate(prevProps: CollectionListProps, prevState: CollectionListState) {
        if (this.currentNewFolder && this.folderRefs[this.currentNewFolder.id]) {
            this.folderRefs[this.currentNewFolder.id].edit();
            this.currentNewFolder = undefined;
        }
    }

    render() {
        const { collections, records, activeKey } = this.props;
        const recordStyle = { height: '30px', lineHeight: '30px' };
        const loopRecords = (data: DtoRecord[], cid: string, inFolder: boolean = false) => data.map(r => {

            if (r.category === RecordCategory.folder) {
                const isOpen = this.state.openKeys.indexOf(r.id) > -1;
                const children = _.remove(data, (d) => d.pid === r.id);
                return (
                    <SubMenu className="folder" key={r.id} title={(
                        <RecordFolder
                            ref={ele => this.folderRefs[r.id] = ele}
                            record={{ ...r }}
                            isOpen={isOpen}
                            deleteRecord={() => this.props.deleteRecord(r.id, records[cid])}
                            onNameChanged={(name) => this.changeFolderName(r, name)}
                        />
                    )}>
                        {loopRecords(children, cid, true)}
                    </SubMenu>
                );
            }
            return (
                <MenuItem key={r.id} style={recordStyle} data={r}>
                    <RecordItem
                        record={{ ...r }}
                        inFolder={inFolder}
                        duplicateRecord={() => this.props.duplicateRecord(r)}
                        deleteRecord={() => this.props.deleteRecord(r.id, records[cid])}
                    />
                </MenuItem>
            );
        });

        return (
            <div>
                <Menu
                    className="collection-tree"
                    style={{ width: 300 }}
                    onOpenChange={this.onOpenChanged}
                    mode="inline"
                    inlineIndent={0}
                    openKeys={this.state.openKeys}
                    selectedKeys={[activeKey]}
                    onSelect={this.onSelectChanged}
                >
                    {
                        _.chain(collections).values<DtoCollection>().sortBy('name').value().map(c => {
                            const recordCount = _.values(records[c.id]).filter(r => r.category === RecordCategory.record).length;
                            let sortRecords = _.chain(records[c.id]).values<DtoRecord>().sortBy(['category', 'name']).value();
                            return (
                                <SubMenu className="collection-item" key={c.id} title={(
                                    <CollectionItem
                                        collection={{ ...c }}
                                        recordCount={recordCount}
                                        onNameChanged={(name) => this.props.changeCollectionName(c, name.trim() === '' ? c.name : name)}
                                        deleteCollection={() => this.props.deleteCollection(c.id)}
                                        createFolder={this.createFolder}
                                    />
                                )}>
                                    {
                                        sortRecords.length === 0 ?
                                            <div style={{ height: 20 }} /> :
                                            loopRecords(sortRecords, c.id)
                                    }
                                </SubMenu>
                            );
                        })
                    }
                </Menu>
                <div className="collection-tree-bottom" />
            </div>
        );
    }
}

const mapStateToProps = (state: State): CollectionListStateProps => {
    return {
        collections: state.collectionsInfo.collections,
        records: state.collectionsInfo.records,
        activeKey: state.collectionState.activeKey
    };
};

const mapDispatchToProps = (dispatch: Dispatch<{}>): CollectionListDispatchProps => {
    return {
        refresh: () => dispatch(refreshCollectionAction()),
        activeRecord: (record) => dispatch(activeRecordAction(record)),
        deleteRecord: (id, records) => {
            const record = records[id];
            if (record.category === RecordCategory.folder) {
                const children = _.values(records).filter(r => r.pid === id);
                children.forEach(r => dispatch(removeTabAction(r.id)));
            }
            dispatch(removeTabAction(id));
            dispatch(actionCreator(DeleteRecordType, record));
        },
        deleteCollection: id => dispatch(actionCreator(DeleteCollectionType, id)),
        updateCollection: collection => dispatch(actionCreator(UpdateCollectionType, collection)),
        createCollection: collection => dispatch(actionCreator(CreateCollectionType, collection)),
        changeFolderName: (record, name) => dispatch(actionCreator(SaveRecordType, { isNew: false, record: { ...record, name } })),
        changeCollectionName: (collection, name) => dispatch(actionCreator(SaveCollectionType, { isNew: false, collection: { ...collection, name } })),
        duplicateRecord: (record) => dispatch(actionCreator(SaveRecordType, { isNew: true, record: { ...record, id: StringUtil.generateUID(), name: `${record.name}.copy` } })),
        createFolder: (record) => dispatch(actionCreator(SaveRecordType, { isNew: true, record }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CollectionList);