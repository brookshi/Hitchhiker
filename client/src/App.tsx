import * as React from 'react';
import './style/App.less';
import CollectionList from './modules/collection_tree';
import { Layout, Menu, Icon, Tooltip } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import ReqResPanel from './modules/req_res_panel';
import Team from './modules/team';
import PerfectScrollbar from 'react-perfect-scrollbar';
import './style/perfect-scrollbar.min.css';
import { State, UIState } from './state';
import { connect, Dispatch } from 'react-redux';
import { refreshCollectionAction } from './modules/collection_tree/action';
import Splitter from './components/splitter';
import { actionCreator, ResizeCollectionPanelType } from './action';
import { LoginType } from './modules/login/action';
import Config from './common/config';

const { Header, Content, Sider } = Layout;

interface AppStateProps {

  isLogin: boolean;

  isFetchCollection: boolean;

  uiState: UIState;
}

interface AppDispatchProps {

  getCollection();

  login();

  resizeCollectionPanel(width: number);
}

type AppProps = AppStateProps & AppDispatchProps;

interface AppState {

  activeModule: 'collection' | 'team' | 'schedule' | 'api_doc' | 'api_mock' | 'stress_test' | '' | any;

  collapsed: boolean;

  mode: 'inline' | 'vertical';
}

class App extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);
    this.state = {
      activeModule: 'collection',
      collapsed: false,
      mode: 'inline'
    };
  }

  componentWillMount() {
    if (!this.props.isLogin) {
      this.props.login();
    }
  }

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.isLogin && !nextProps.isFetchCollection) {
      this.props.getCollection();
    }
  }

  private onCollapse = (collapsed) => {
    this.setState({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
      activeModule: collapsed ? '' : this.state.activeModule
    });
  }

  private onClick = (param: ClickParam) => {
    const { collapsed, activeModule } = this.state;
    if (activeModule === param.key) {
      this.setState({ ...this.state, collapsed: !collapsed, activeModule: collapsed ? activeModule : '' });
    } else {
      this.setState({ ...this.state, collapsed: false, activeModule: param.key });
    }
  }

  private collectionModule = () => {
    return (
      <Layout className="main-panel">
        <Sider
          className="collection-sider"
          style={{ minWidth: this.state.collapsed ? 0 : this.props.uiState.collectionPanelWidth }}
          collapsible={true}
          collapsedWidth="0.1"
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}>
          <CollectionList />
        </Sider>
        <Splitter resizeCollectionPanel={this.props.resizeCollectionPanel} />
        <Content style={{ marginTop: 4 }}>
          <PerfectScrollbar>
            <ReqResPanel />
          </PerfectScrollbar>
        </Content>
      </Layout>
    );
  }

  private activeModule = () => {
    switch (this.state.activeModule) {
      case 'collection':
        return this.collectionModule();
      case 'team':
        return <Team />;
      default:
        return this.collectionModule();
    }
  }

  render() {
    return (
      <Layout className="layout">
        <Header />
        <Layout>
          <Sider style={{ maxWidth: Config.ToolBarWidth }}>
            <Menu
              className="sider-menu"
              mode="vertical"
              theme="dark"
              selectedKeys={[this.state.activeModule]}
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
}

const mapStateToProps = (state: State): AppStateProps => {
  return {
    uiState: state.uiState,
    isLogin: state.userState.isLoaded,
    isFetchCollection: state.collectionState.isLoaded
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): AppDispatchProps => {
  return {
    getCollection: () => dispatch(refreshCollectionAction()),
    login: () => dispatch(actionCreator(LoginType)),
    resizeCollectionPanel: (width) => dispatch(actionCreator(ResizeCollectionPanelType, width))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
