import React from 'react';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { State } from '../../state/index';
import { actionCreator } from '../../action/index';
import Splitter from '../splitter';
import { UpdateLeftPanelType, ResizeLeftPanelType } from '../../action/ui';
import './styles/index.less';

const { Content, Sider } = Layout;

interface OwnProps {

    sider: any;

    content: any;
}

interface SiderLayoutStateProps extends OwnProps {

    collapsed: boolean;

    leftPanelWidth: number;

    activeModule: string;
}

interface SiderLayoutDispatchProps {

    resizeLeftPanel(width: number);

    updateLeftPanelStatus(collapsed: boolean, activeModule: string);
}

type SiderLayoutProps = SiderLayoutStateProps & SiderLayoutDispatchProps;

interface SiderLayoutState { }

class SiderLayout extends React.Component<SiderLayoutProps, SiderLayoutState> {

    private onCollapse = (collapsed) => {
        this.props.updateLeftPanelStatus(collapsed, collapsed ? '' : this.props.activeModule);
    }

    public render() {
        const { collapsed, leftPanelWidth, sider, content } = this.props;

        return (
            <Layout className="main-panel">
                <Sider
                    className="main-sider"
                    style={{ minWidth: collapsed ? 0 : leftPanelWidth }}
                    collapsible={true}
                    collapsedWidth="0.1"
                    collapsed={collapsed}
                    onCollapse={this.onCollapse}
                >
                    {sider}
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content>
                    {content}
                </Content>
            </Layout>
        );
    }
}

const mapStateToProps = (state: State, ownProps: OwnProps): SiderLayoutStateProps => {
    const { leftPanelWidth, collapsed, activeModule } = state.uiState.appUIState;
    return {
        leftPanelWidth,
        collapsed,
        activeModule,
        ...ownProps
    };
};

const mapDispatchToProps = (dispatch: any): SiderLayoutDispatchProps => {
    return {
        updateLeftPanelStatus: (collapsed, activeModule) => dispatch(actionCreator(UpdateLeftPanelType, { collapsed, activeModule })),
        resizeLeftPanel: (width) => dispatch(actionCreator(ResizeLeftPanelType, width))
    };
};

export default connect<SiderLayoutStateProps, SiderLayoutDispatchProps, OwnProps>(
    mapStateToProps,
    mapDispatchToProps,
)(SiderLayout) as any;