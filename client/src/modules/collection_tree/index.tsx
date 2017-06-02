import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Menu, Dropdown, Icon, Button, Modal, TreeSelect, Input, Tooltip } from 'antd';
import { State } from '../../state';
import RecordFolder from './record_folder';
import RecordItem from './record_item';
import CollectionItem from './collection_item';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { SelectParam } from 'antd/lib/menu';
import * as _ from 'lodash';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { RecordCategory } from '../../common/record_category';
import { actionCreator } from '../../action';
import { DeleteCollectionType, SaveCollectionType, SelectedTeamChangedType, CollectionOpenKeysType } from '../../action/collection';
import { DeleteRecordType, SaveRecordType, RemoveTabType, ActiveRecordType, MoveRecordType } from '../../action/record';
import { StringUtil } from '../../utils/string_util';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { AllTeam } from '../../state/collection';
import './style/index.less';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const NewCollectionName = 'New collection';

interface CollectionListStateProps {

    collections: _.Dictionary<DtoCollection>;

    records: _.Dictionary<_.Dictionary<DtoRecord>>;

    activeKey: string;

    teams: { id: string, name: string }[];

    openKeys: string[];

    selectedTeam: string;
}

interface CollectionListDispatchProps {

    activeRecord: (record: DtoRecord) => void;

    deleteRecord(id: string, records: _.Dictionary<DtoRecord>);

    deleteCollection(id: string);

    updateRecord(record: DtoRecord);

    saveCollection(collection: DtoCollection);

    updateCollection(collection: DtoCollection);

    duplicateRecord(record: DtoRecord);

    createFolder(record: DtoRecord);

    moveRecord(record: DtoRecord);

    openKeysChanged(openKeys: string[]);

    selectTeam(teamid: string);
}

type CollectionListProps = CollectionListStateProps & CollectionListDispatchProps;

interface CollectionListState {

    openKeys: string[];

    isAddCollectionDlgOpen: boolean;

    selectedNewCollectionTeam?: string;

    newCollectionName: string;
}

class CollectionList extends React.Component<CollectionListProps, CollectionListState> {

    private currentNewFolder: DtoRecord | undefined;
    private folderRefs: _.Dictionary<RecordFolder> = {};
    private newCollectionNameRef: Input;

    constructor(props: CollectionListProps) {
        super(props);
        this.state = {
            openKeys: [],
            isAddCollectionDlgOpen: false,
            newCollectionName: NewCollectionName
        };
    }

    componentDidUpdate(prevProps: CollectionListProps, prevState: CollectionListState) {
        if (this.currentNewFolder && this.folderRefs[this.currentNewFolder.id]) {
            this.folderRefs[this.currentNewFolder.id].edit();
            this.currentNewFolder = undefined;
        }
    }

    private onOpenChanged = (openKeys: string[]) => {
        this.props.openKeysChanged(openKeys);
    }

    private onSelectChanged = (param: SelectParam) => {
        this.props.activeRecord(param.item.props.data);
    }

    private createFolder = (folder: DtoRecord) => {
        this.currentNewFolder = folder;
        if (folder &&
            folder.collectionId &&
            this.props.openKeys.indexOf(folder.collectionId) < 0) {
            this.props.openKeysChanged([...this.props.openKeys, folder.collectionId]);
        }
        this.props.createFolder(folder);
    }

    private changeFolderName = (folder: DtoRecord, name: string) => {
        if (name.trim() !== '' && name !== folder.name) {
            folder.name = name;
            this.props.updateRecord(folder);
        }
    }

    private changeCollectionName = (collection: DtoCollection, name: string) => {
        if (name.trim() !== '' && name !== collection.name) {
            collection.name = name;
            this.props.updateCollection(collection);
        }
    }

    private moveRecordToFolder = (record: DtoRecord, collectionId: string, folderId: string) => {
        this.props.moveRecord({ ...record, pid: folderId, collectionId });
    }

    private moveToCollection = (record: DtoRecord, collectionId: string) => {
        this.props.moveRecord({ ...record, collectionId, pid: '' });
        if (record.category === RecordCategory.folder) {
            _.values(this.props.records[record.collectionId]).filter(r => r.pid === record.id).forEach(r => {
                this.props.moveRecord({ ...r, collectionId });
            });
        }
    }

    private onTeamChanged = (e) => {
        this.props.selectTeam(e.key);
    }

    private getTeamMenu = () => {
        const teams = this.props.teams;
        return (
            <Menu style={{ minWidth: 150 }} onClick={this.onTeamChanged} selectedKeys={[this.props.selectedTeam]}>
                <Menu.Item key={AllTeam}>{AllTeam}</Menu.Item>
                {teams.map(t => <Menu.Item key={t.id}>{t.name}</Menu.Item>)}
            </Menu>
        );
    }

    private getCurrentTeam = () => {
        return this.props.teams.find(t => t.id === this.props.selectedTeam) || { id: AllTeam, name: AllTeam };
    }

    private getOpenKeys = () => {
        const openKeys = this.props.openKeys;
        if (this.props.selectedTeam === AllTeam) {
            return openKeys;
        }
        return _.filter(openKeys, k => this.props.collections[k] && this.props.collections[k].teamId === this.props.selectedTeam);
    }

    private getDisplayCollections = () => {
        const collections = _.chain(this.props.collections).values<DtoCollection>().sortBy('name').value();
        if (this.props.selectedTeam === AllTeam) {
            return collections;
        }
        return _.filter(collections, c => c.teamId === this.props.selectedTeam);
    }

    private addCollection = () => {
        this.setState({ ...this.state, isAddCollectionDlgOpen: true }, () => this.newCollectionNameRef && this.newCollectionNameRef.focus());
    }

    private onCreateCollection = () => {
        if (!this.state.selectedNewCollectionTeam) {
            return;
        }

        const collection: DtoCollection = {
            id: StringUtil.generateUID(),
            name: this.state.newCollectionName,
            teamId: this.state.selectedNewCollectionTeam,
            description: ''
        };
        this.props.saveCollection(collection);
        this.setState({ ...this.state, isAddCollectionDlgOpen: false, newCollectionName: NewCollectionName, selectedNewCollectionTeam: undefined });
    }

    private loopRecords = (data: DtoRecord[], cid: string, inFolder: boolean = false) => {
        return data.map(r => {
            const recordStyle = { height: '30px', lineHeight: '30px' };
            const { records } = this.props;

            if (r.category === RecordCategory.folder) {
                const isOpen = this.props.openKeys.indexOf(r.id) > -1;
                const children = _.remove(data, (d) => d.pid === r.id);
                return (
                    <SubMenu className="folder" key={r.id} title={(
                        <RecordFolder
                            ref={ele => this.folderRefs[r.id] = ele}
                            folder={{ ...r }}
                            isOpen={isOpen}
                            deleteRecord={() => this.props.deleteRecord(r.id, records[cid])}
                            onNameChanged={(name) => this.changeFolderName(r, name)}
                            moveRecordToFolder={this.moveRecordToFolder}
                            moveToCollection={this.moveToCollection}
                        />
                    )}>
                        {this.loopRecords(children, cid, true)}
                    </SubMenu>
                );
            }
            return (
                <MenuItem key={r.id} style={recordStyle} data={r}>
                    <RecordItem
                        record={{ ...r }}
                        inFolder={inFolder}
                        moveRecordToFolder={this.moveRecordToFolder}
                        moveToCollection={this.moveToCollection}
                        duplicateRecord={() => this.props.duplicateRecord(r)}
                        deleteRecord={() => this.props.deleteRecord(r.id, records[cid])}
                    />
                </MenuItem>
            );
        });
    }

    render() {
        const { records, activeKey } = this.props;
        const displayCollections = this.getDisplayCollections();

        return (
            <div className="collection-panel">
                <div className="small-toolbar">
                    <span>Team:</span>
                    <span>
                        <Dropdown overlay={this.getTeamMenu()} trigger={['click']} style={{ width: 200 }}>
                            <a className="ant-dropdown-link" href="#">
                                {this.getCurrentTeam().name} <Icon type="down" />
                            </a>
                        </Dropdown>
                    </span>
                    <Tooltip mouseEnterDelay={1} placement="bottom" title="create collection">
                        <Button className="icon-btn" type="primary" icon="folder-add" onClick={this.addCollection} />
                    </Tooltip>
                </div>
                <div className="collection-tree-container">
                    <PerfectScrollbar>
                        <Menu
                            className="collection-tree"
                            onOpenChange={this.onOpenChanged}
                            mode="inline"
                            inlineIndent={0}
                            openKeys={this.getOpenKeys()}
                            selectedKeys={[activeKey]}
                            onSelect={this.onSelectChanged}
                        >
                            {
                                displayCollections.map(c => {
                                    const recordCount = _.values(records[c.id]).filter(r => r.category === RecordCategory.record).length;
                                    let sortRecords = _.chain(records[c.id]).values<DtoRecord>().sortBy(['category', 'name']).value();

                                    return (
                                        <SubMenu
                                            className={`${c.id !== displayCollections[0].id ? 'collection-separator-line' : ''} collection-item`}
                                            key={c.id}
                                            title={(
                                                <CollectionItem
                                                    collection={{ ...c }}
                                                    recordCount={recordCount}
                                                    onNameChanged={(name) => this.changeCollectionName(c, name)}
                                                    deleteCollection={() => this.props.deleteCollection(c.id)}
                                                    moveToCollection={this.moveToCollection}
                                                    createFolder={this.createFolder}
                                                />
                                            )}>
                                            {
                                                sortRecords.length === 0 ?
                                                    <div style={{ height: 20 }} /> :
                                                    this.loopRecords(sortRecords, c.id)
                                            }
                                        </SubMenu>
                                    );
                                })
                            }
                        </Menu>
                        {displayCollections.length === 0 ? '' : <div className="collection-tree-bottom" />}
                    </PerfectScrollbar>
                </div>
                <Modal
                    title="Create new collection"
                    visible={this.state.isAddCollectionDlgOpen}
                    okText="OK"
                    cancelText="Cancel"
                    onOk={this.onCreateCollection}
                    onCancel={() => this.setState({ ...this.state, isAddCollectionDlgOpen: false })}
                >
                    <div style={{ marginBottom: '8px' }}>Select team for this collection:</div>
                    <Input spellCheck={false} ref={ele => this.newCollectionNameRef = ele} style={{ width: '100%', marginBottom: '8px' }} value={this.state.newCollectionName} onChange={e => this.setState({ ...this.state, newCollectionName: e.currentTarget.value })} />
                    <div style={{ marginBottom: '8px' }}>Select team for this collection:</div>
                    <TreeSelect
                        allowClear={true}
                        style={{ width: '100%' }}
                        dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                        placeholder="Please select team"
                        treeDefaultExpandAll={true}
                        value={this.state.selectedNewCollectionTeam}
                        onChange={(e) => this.setState({ ...this.state, selectedNewCollectionTeam: e })}
                        treeData={this.props.teams.map(t => ({ key: t.id, value: t.id, label: t.name }))} />
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state: State): CollectionListStateProps => {
    const { collectionsInfo, openKeys, selectedTeam } = state.collectionState;
    let teams = _.values(state.teamState.teams).map(t => ({ id: t.id ? t.id : '', name: t.name ? t.name : '' }));

    return {
        collections: collectionsInfo.collections,
        records: collectionsInfo.records,
        activeKey: state.displayRecordsState.activeKey,
        teams: _.sortBy(teams, t => t.name),
        openKeys,
        selectedTeam
    };
};

const mapDispatchToProps = (dispatch: Dispatch<{}>): CollectionListDispatchProps => {
    return {
        activeRecord: (record) => dispatch(actionCreator(ActiveRecordType, record)),
        deleteRecord: (id, records) => {
            const record = records[id];
            if (record.category === RecordCategory.folder) {
                const children = _.values(records).filter(r => r.pid === id);
                children.forEach(r => dispatch(actionCreator(RemoveTabType, r.id)));
            }
            dispatch(actionCreator(RemoveTabType, id));
            dispatch(actionCreator(DeleteRecordType, record));
        },
        deleteCollection: id => { dispatch(actionCreator(DeleteCollectionType, id)); },
        updateRecord: (record) => dispatch(actionCreator(SaveRecordType, { isNew: false, record })),
        saveCollection: (collection) => { dispatch(actionCreator(SaveCollectionType, { isNew: true, collection })); },
        updateCollection: (collection) => { dispatch(actionCreator(SaveCollectionType, { isNew: false, collection })); },
        duplicateRecord: (record) => dispatch(actionCreator(SaveRecordType, { isNew: true, record: { ...record, id: StringUtil.generateUID(), name: `${record.name}.copy` } })),
        createFolder: (record) => dispatch(actionCreator(SaveRecordType, { isNew: true, record })),
        moveRecord: record => dispatch(actionCreator(MoveRecordType, { record })),
        openKeysChanged: openKeys => dispatch(actionCreator(CollectionOpenKeysType, openKeys)),
        selectTeam: teamId => dispatch(actionCreator(SelectedTeamChangedType, teamId))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CollectionList);