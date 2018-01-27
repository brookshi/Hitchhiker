import React from 'react';
import * as _ from 'lodash';
import JSONTree from 'react-json-tree';
import { DtoAssert } from '../../../../api/interfaces/dto_assert';
import './style/index.less';
import { Modal, Button, Icon } from 'antd';
import AssertItem from './assert_item';
import { AssertType, AssertTypeFuncMapping } from './assert_funcs';

interface AssertJsonViewProps {

    data: any;

    assertInfos: _.Dictionary<DtoAssert[]>;

    envs: string[];

    height: number;

    onAssertInfosChanged(assertInfos: _.Dictionary<DtoAssert[]>);
}

interface AssertJsonViewState {

    editedAssertInfos: DtoAssert[];

    isEditDlgOpen: boolean;

    keys: string[];
}

class AssertJsonView extends React.Component<AssertJsonViewProps, AssertJsonViewState> {

    constructor(props: AssertJsonViewProps) {
        super(props);
        this.state = {
            editedAssertInfos: [],
            isEditDlgOpen: false,
            keys: []
        };
    }

    private getType = (keys: string[], root: any) => {
        let parent = root;
        let isArr = _.isArray(parent);
        if (keys.length > 1) {
            for (let i = keys.length - 2; i >= 0; i--) {
                isArr = _.isArray(parent);
                const key = isArr ? parseInt(keys[i]) : keys[i];
                const current = parent[key];
                if (i === 0) {
                    return _.isArray(current) ? 'array' : typeof current;
                }
                parent = current;
            }
        }
        return isArr ? 'array' : 'object';
    }

    private onEditAssert = (e: any, keys: string[], type: string) => {
        e.stopPropagation();
        const currentKey = this.getCurrentKey(keys);
        const infos = this.props.assertInfos[currentKey];
        this.setState({ ...this.state, keys, isEditDlgOpen: true, editedAssertInfos: !infos || infos.length === 0 ? [this.createDefaultAssertInfo(keys, type)] : infos });
    }

    private getCurrentKey = (keys: string[]) => {
        return _.reverse([...keys]).join('/');
    }

    private createDefaultAssertInfo = (keys: string[], type: string): DtoAssert => {
        return { target: keys, name: '', function: AssertTypeFuncMapping[type][0], value: '' };
    }

    private addNewAssertInfo = (keys: string[], type: string) => {
        const assertInfo = this.createDefaultAssertInfo(keys, type);
        this.setState({ ...this.state, editedAssertInfos: [...this.state.editedAssertInfos, assertInfo] });
    }

    private delAssertInfo = (index: number) => {
        const editedAssertInfos = [...this.state.editedAssertInfos];
        editedAssertInfos.splice(index, 1);
        this.setState({ ...this.state, editedAssertInfos });
    }

    private generateKey = (keys: string[], root: any) => {
        const type = this.getType(keys, root);
        const currentKey = this.getCurrentKey(keys);
        if (!AssertTypeFuncMapping[type]) {
            return <span>{keys[0]}</span>;
        }
        return (
            <span className="tree-key">{keys[0]}
                <span onClick={e => this.onEditAssert(e, keys, type)}>
                    <span className="tree-key-ex">
                        <svg
                            viewBox="0 0 40 40"
                            height="14"
                            fill="currentColor"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <g>
                                <path d="m19.8 26.4l2.6-2.6-3.4-3.4-2.6 2.6v1.3h2.2v2.1h1.2z m9.8-16q-0.3-0.4-0.7 0l-7.8 7.8q-0.4 0.4 0 0.7t0.7 0l7.8-7.8q0.4-0.4 0-0.7z m1.8 13.2v4.3q0 2.6-1.9 4.5t-4.5 1.9h-18.6q-2.6 0-4.5-1.9t-1.9-4.5v-18.6q0-2.7 1.9-4.6t4.5-1.8h18.6q1.4 0 2.6 0.5 0.3 0.2 0.4 0.5 0.1 0.4-0.2 0.7l-1.1 1.1q-0.3 0.3-0.7 0.1-0.5-0.1-1-0.1h-18.6q-1.4 0-2.5 1.1t-1 2.5v18.6q0 1.4 1 2.5t2.5 1h18.6q1.5 0 2.5-1t1.1-2.5v-2.9q0-0.2 0.2-0.4l1.4-1.5q0.3-0.3 0.8-0.1t0.4 0.6z m-2.1-16.5l6.4 6.5-15 15h-6.4v-6.5z m9.9 3l-2.1 2-6.4-6.4 2.1-2q0.6-0.7 1.5-0.7t1.5 0.7l3.4 3.4q0.6 0.6 0.6 1.5t-0.6 1.5z" />
                            </g>
                        </svg>
                    </span>
                    {(this.props.assertInfos[currentKey] || []).map(info => <span className="tree-key-info">{`${info.function} ${info.value}`}</span>)}
                </span>
            </span>
        );
    }

    private onAssertItemChanged = (info: DtoAssert, index: number) => {
        const infos = [...this.state.editedAssertInfos];
        infos[index] = info;
        this.setState({ ...this.state, editedAssertInfos: infos });
    }

    private completeAssert = () => {
        const { keys, editedAssertInfos } = this.state;
        const currentKey = this.getCurrentKey(keys);
        this.props.onAssertInfosChanged({ ...this.props.assertInfos, [currentKey]: editedAssertInfos });
        this.setState({ ...this.state, isEditDlgOpen: false });
    }

    private get assertEditDialog() {
        const { isEditDlgOpen, editedAssertInfos, keys } = this.state;
        const { data, envs } = this.props;
        const type = this.getType(keys, data) as AssertType;
        return (
            <Modal
                visible={isEditDlgOpen}
                okText="OK"
                cancelText="Cancel"
                title={<span><span>{this.getCurrentKey(keys)}</span><Button ghost={true} size="small" className="assert-item-add" type="primary" icon="plus" onClick={() => this.addNewAssertInfo(keys, type)} >New assert item</Button></span>}
                width={860}
                onOk={() => this.completeAssert()}
                onCancel={() => this.setState({ ...this.state, isEditDlgOpen: false })}
            >
                {
                    editedAssertInfos.map((info, i) => (
                        <div style={{ marginBottom: 4 }}>
                            <AssertItem key={i} type={type} envs={envs} assertInfo={info} onAssertInfoChanged={d => this.onAssertItemChanged(d, i)} />
                            <Icon className="assert-item-close" type="close" onClick={() => this.delAssertInfo(i)} />
                        </div>
                    ))
                }
            </Modal>
        );
    }

    public render() {

        return (
            <div className="json-tree" style={{ height: this.props.height }}>
                <JSONTree
                    data={this.props.data}
                    labelRenderer={(key) => this.generateKey(key, this.props.data)}
                    theme="summerfruit"
                    invertTheme={true}
                />
                {this.assertEditDialog}
            </div>
        );
    }
}

export default AssertJsonView;