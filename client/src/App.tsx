import * as React from 'react';
import CollectionList from './modules/collection_tree';
import { Layout, Menu, Icon, Tooltip, Button } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import ReqResPanel from './modules/req_res_panel';
import Team from './modules/team';
import HeaderPanel from './modules/header';
import PerfectScrollbar from 'react-perfect-scrollbar';
import './style/perfect-scrollbar.min.css';
import { State } from './state';
import { connect, Dispatch } from 'react-redux';
import Splitter from './components/splitter';
import Config from './common/config';
import { actionCreator } from './action';
import { LoginType } from './action/login';
import { RefreshCollectionType } from './action/collection';
import { ResizeLeftPanelType, UpdateLeftPanelType } from './action/ui';
import './style/App.less';
import { FetchLocalDataType } from './action/local_data';
import LoginPanel from './modules/login';

const { Header, Content, Sider } = Layout;

interface AppStateProps {

  activeModule: string;

  collapsed: boolean;

  isLogin: boolean;

  userId: string;

  isFetchCollection: boolean;

  isFetchLocalData: boolean;

  leftPanelWidth: number;
}

interface AppDispatchProps {

  updateLeftPanelStatus(collapsed: boolean, activeModule: string);

  getCollection();

  login();

  resizeLeftPanel(width: number);

  fetchLocalData(userId: string);
}

type AppProps = AppStateProps & AppDispatchProps;

interface AppState { }

class App extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);
  }

  componentWillMount() {
    // if (!this.props.isLogin) {
    //   this.props.login();
    // }
  }

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.isLogin && !nextProps.isFetchCollection) {
      this.props.getCollection();
    }
    if (nextProps.isLogin && nextProps.isFetchCollection && !nextProps.isFetchLocalData) {
      this.props.fetchLocalData(this.props.userId);
    }
  }

  private onCollapse = (collapsed) => {
    this.props.updateLeftPanelStatus(collapsed, collapsed ? '' : this.props.activeModule);
  }

  private onClick = (param: ClickParam) => {

    const { collapsed, activeModule, updateLeftPanelStatus } = this.props;
    if (activeModule === param.key) {
      updateLeftPanelStatus(!collapsed, collapsed ? activeModule : '');
    } else {
      updateLeftPanelStatus(false, param.key);
    }
  }

  private collectionModule = () => {
    const { collapsed, leftPanelWidth } = this.props;
    return (
      <Layout className="main-panel">
        <Sider
          className="collection-sider"
          style={{ minWidth: collapsed ? 0 : leftPanelWidth }}
          collapsible={true}
          collapsedWidth="0.1"
          collapsed={collapsed}
          onCollapse={this.onCollapse}>
          <CollectionList />
        </Sider>
        <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
        <Content style={{ marginTop: 4 }}>
          <PerfectScrollbar>
            <ReqResPanel />
          </PerfectScrollbar>
        </Content>
      </Layout>
    );
  }

  private activeModule = () => {
    switch (this.props.activeModule) {
      case 'collection':
        return this.collectionModule();
      case 'team':
        return <Team />;
      default:
        return this.collectionModule();
    }
  }

  private get loginPanel() {
    return (
      <LoginPanel />
    );
  }

  private get mainPanel() {
    return (
      <Layout className="layout">
        <Header>
          <Button style={{ display: 'none' }} />
          <HeaderPanel />
        </Header>
        <Layout>
          <Sider style={{ maxWidth: Config.ToolBarWidth }}>
            <Menu
              className="sider-menu"
              mode="vertical"
              theme="dark"
              selectedKeys={[this.props.activeModule]}
              onClick={this.onClick}
            >
              <Menu.Item key="collection">
                <Tooltip mouseEnterDelay={1} placement="right" title="Collections">
                  <Icon type="wallet" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="team">
                <Tooltip mouseEnterDelay={1} placement="right" title="Team">
                  <Icon type="team" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="schedule">
                <Tooltip mouseEnterDelay={1} placement="right" title="Scheduler">
                  <Icon type="schedule" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="api_doc">
                <Tooltip mouseEnterDelay={1} placement="right" title="Api document">
                  <Icon type="file-text" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="api_mock">
                <Tooltip mouseEnterDelay={1} placement="right" title="Api mock">
                  <Icon type="api" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="stress_test">
                <Tooltip mouseEnterDelay={1} placement="right" title="Stress test">
                  <Icon type="code-o" />
                </Tooltip>
              </Menu.Item>
            </Menu>
          </Sider>
          {this.activeModule()}
        </Layout>
      </Layout>
    );
  }

  render() {
    const { isLogin, isFetchCollection, isFetchLocalData } = this.props;
    return isLogin && isFetchCollection && isFetchLocalData ? this.mainPanel : this.loginPanel;
  }
}

const mapStateToProps = (state: State): AppStateProps => {
  const { leftPanelWidth, collapsed, activeModule } = state.uiState.appUIState;
  return {
    leftPanelWidth,
    collapsed,
    activeModule,
    isLogin: state.userState.isLoaded,
    isFetchCollection: state.collectionState.isLoaded,
    isFetchLocalData: state.localDataState.isLocalDataLoaded,
    userId: state.userState.userInfo.id
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): AppDispatchProps => {
  return {
    getCollection: () => dispatch(actionCreator(RefreshCollectionType)),
    login: () => dispatch(actionCreator(LoginType)),
    resizeLeftPanel: (width) => dispatch(actionCreator(ResizeLeftPanelType, width)),
    updateLeftPanelStatus: (collapsed, activeModule) => dispatch(actionCreator(UpdateLeftPanelType, { collapsed, activeModule })),
    fetchLocalData: (userId) => dispatch(actionCreator(FetchLocalDataType, userId))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
