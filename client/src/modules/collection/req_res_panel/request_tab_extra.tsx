import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { reqResUIDefaultValue } from '../../../state/ui';
import { Button, Dropdown, Icon, Menu } from 'antd';
import { KeyValueEditType, KeyValueEditMode } from '../../../common/custom_type';
import { bodyTypes } from '../../../common/body_type';
import { defaultBodyType } from '../../../common/constants';
import { DtoHeader } from '../../../../../api/interfaces/dto_header';
import { StringUtil } from '../../../utils/string_util';
import { testSnippets } from '../../../common/test_snippet';
import { getActiveTabKey, getBodyType } from './selector';
import { actionCreator } from '../../../action/index';
import { SwitchBodyType, AppendTestType } from '../../../action/record';

interface RequestTabExtraStateProps {

    activeKey: string;

    activeTabKey: string;

    bodyType: string;
}

interface RequestTabExtraDispatchProps {

    changeBodyType(id: string, bodyType: string, newHeader: DtoHeader);

    appendTest(id: string, test: string);
}

type RequestTabExtraProps = RequestTabExtraStateProps & RequestTabExtraDispatchProps;

interface RequestTabExtraState {

    headersEditMode: KeyValueEditMode;
}

class RequestTabExtra extends React.Component<RequestTabExtraProps, RequestTabExtraState> {

    constructor(props: RequestTabExtraProps) {
        super(props);
        this.state = {
            headersEditMode: KeyValueEditType.keyValueEdit
        };
    }

    private onHeaderModeChanged = () => {
        this.setState({
            ...this.state,
            headersEditMode: KeyValueEditType.getReverseMode(this.state.headersEditMode)
        });
    }

    private getBodyTypeMenu = () => {
        return (
            <Menu onClick={this.onBodyTypeChanged} selectedKeys={[this.currentBodyType()]}>
                {Object.keys(bodyTypes).map(type => <Menu.Item key={type}>{type}</Menu.Item>)}
            </Menu>
        );
    }

    private onBodyTypeChanged = (e) => {
        const bodyType = e.key;
        const header = { isActive: true, key: 'content-type', value: bodyType, id: StringUtil.generateUID() };
        this.props.changeBodyType(this.props.activeKey, bodyType, header);
    }

    private currentBodyType = () => this.props.bodyType || defaultBodyType;

    private onSelectSnippet = (e) => {
        const snippet = testSnippets[e.key];
        this.props.appendTest(this.props.activeKey, snippet);
    }

    private snippetsMenu = (
        <Menu onClick={this.onSelectSnippet}>
            {Object.keys(testSnippets).map(s => <Menu.Item key={s}>{s}</Menu.Item>)}
        </Menu>
    );

    public render() {

        const { activeTabKey } = this.props;

        return (
            activeTabKey === reqResUIDefaultValue.activeReqTab ? (
                <Button className="tab-extra-button" onClick={this.onHeaderModeChanged}>
                    {KeyValueEditType.getReverseMode(this.state.headersEditMode)}
                </Button>
            ) : (
                    activeTabKey === 'body' ? (
                        <Dropdown overlay={this.getBodyTypeMenu()} trigger={['click']} style={{ width: 200 }}>
                            <a className="ant-dropdown-link" href="#">
                                {this.currentBodyType()} <Icon type="down" />
                            </a>
                        </Dropdown>
                    ) : (
                            <Dropdown overlay={this.snippetsMenu} trigger={['click']}>
                                <a className="ant-dropdown-link" href="#">
                                    Snippets <Icon type="down" />
                                </a>
                            </Dropdown>
                        ))
        );
    }
}

const mapStateToProps = (state: any): RequestTabExtraStateProps => {
    return {
        activeKey: state.displayRecordsState.activeKey,
        activeTabKey: getActiveTabKey(state),
        bodyType: getBodyType(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestTabExtraDispatchProps => {
    return {
        changeBodyType: (id, bodyType, header) => dispatch(actionCreator(SwitchBodyType, { id, bodyType, header })),
        appendTest: (id, test) => dispatch(actionCreator(AppendTestType, { id, test }))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestTabExtra);