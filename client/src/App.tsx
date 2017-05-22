import * as React from 'react';
import './style/App.less';
import CollectionList from './modules/collection_tree';
import { Layout, Menu, Icon, Tooltip } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import ReqResPanel from './modules/req_res_panel';
import PerfectScrollbar from 'react-perfect-scrollbar';
import './style/perfect-scrollbar.min.css';
import { State, UIState } from './state';
import { connect, Dispatch } from 'react-redux';
import { refreshCollectionAction } from './modules/collection_tree/action';
import { actionCreator, ResizeCollectionPanelType } from './action';
import { LoginType } from './modules/login/action';

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
  collapsed: boolean;

  mode: 'inline' | 'vertical';

  selectedKeys: string[];
}

class App extends React.Component<AppProps, AppState> {

  private minCollectionWidth = 100;
  private maxCollectionWidth = 600;
  private toolBarWidth = 50;
  private isResizing: boolean;

  constructor(props: AppProps) {
    super(props);
    this.isResizing = false;
    this.state = {
      collapsed: false,
      mode: 'inline',
      selectedKeys: ['1']
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

  onCollapse = (collapsed) => {
    this.setState({
      collapsed,
      mode: collapsed ? 'vertical' : 'inline',
      selectedKeys: collapsed ? [] : this.state.selectedKeys
    });
  }

  onClick = (param: ClickParam) => {
    const { collapsed, selectedKeys } = this.state;
    if (this.state.selectedKeys.findIndex(o => o === param.key) > -1) {
      this.setState({ ...this.state, collapsed: !collapsed, selectedKeys: collapsed ? selectedKeys : [] });
    } else {
      this.setState({ ...this.state, collapsed: false, selectedKeys: [param.key] });
    }
  }

  onSplitterMove = (e) => {
    e.preventDefault();
    const width = Math.min(Math.max(e.clientX - this.toolBarWidth, this.minCollectionWidth), this.maxCollectionWidth);
    this.props.resizeCollectionPanel(width);
  }

  onSplitterMouseDown = (e) => {
    if (e.button !== 0) {
      return;
    }
    document.addEventListener('mousemove', this.onSplitterMove);
    document.addEventListener('mouseup', this.onSplitterMouseUp);
    e.preventDefault();
  }

  onSplitterMouseUp = (e) => {
    document.removeEventListener('mousemove', this.onSplitterMove);
    document.removeEventListener('mouseup', this.onSplitterMouseUp);
    e.preventDefault();
  }

  render() {
    return (
      <Layout className="layout">
        <Header />
        <Layout>
          <Sider style={{ maxWidth: this.toolBarWidth }}>
            <Menu
              className="sider-menu"
              mode="vertical"
              theme="dark"
              selectedKeys={this.state.selectedKeys}
              onClick={this.onClick}
            >
              <Menu.Item key="1">
                <Tooltip mouseEnterDelay={1} placement="right" title="Collections">
                  <Icon type="wallet" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="2">
                <Tooltip mouseEnterDelay={1} placement="right" title="Team">
                  <Icon type="team" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="3">
                <Tooltip mouseEnterDelay={1} placement="right" title="Scheduler">
                  <Icon type="schedule" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="4">
                <Tooltip mouseEnterDelay={1} placement="right" title="Api document">
                  <Icon type="file-text" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="5">
                <Tooltip mouseEnterDelay={1} placement="right" title="Api mock">
                  <Icon type="api" />
                </Tooltip>
              </Menu.Item>
              <Menu.Item key="6">
                <Tooltip mouseEnterDelay={1} placement="right" title="Stress test">
                  <Icon type="code-o" />
                </Tooltip>
              </Menu.Item>
            </Menu>
          </Sider>
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
            <div className="splitter" onMouseDown={this.onSplitterMouseDown} />
            <Content style={{ marginTop: 4 }}>
              <PerfectScrollbar>
                <ReqResPanel />
              </PerfectScrollbar>
            </Content>
          </Layout>
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
