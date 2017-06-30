import * as React from 'react';
import { Layout, Menu, Icon, Tooltip, Button } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import Collection from './modules/collection';
import Team from './modules/team';
import Schedule from './modules/schedule';
import HeaderPanel from './modules/header';
import './style/perfect-scrollbar.min.css';
import { State } from './state';
import { connect, Dispatch } from 'react-redux';
import Config from './common/config';
import { actionCreator } from './action';
import { UpdateLeftPanelType } from './action/ui';
import LoginPage from './modules/login';
import { RequestStatus } from './common/request_status';
import Perf from 'react-addons-perf';
import './style/App.less';

const { Header, Sider } = Layout;

interface AppStateProps {

  activeModule: string;

  collapsed: boolean;

  isFetchDataSuccess: boolean;
}

interface AppDispatchProps {

  updateLeftPanelStatus(collapsed: boolean, activeModule: string);
}

type AppProps = AppStateProps & AppDispatchProps;

interface AppState { }

class App extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);
    (window as any).Perf = Perf;
  }

  private onClick = (param: ClickParam) => {
    const { collapsed, activeModule, updateLeftPanelStatus } = this.props;
    if (activeModule === param.key) {
      updateLeftPanelStatus(!collapsed, collapsed ? activeModule : '');
    } else {
      updateLeftPanelStatus(false, param.key);
    }
  }

  private activeModule = () => {
    switch (this.props.activeModule) {
      case 'collection':
        return <Collection />;
      case 'team':
        return <Team />;
      case 'schedule':
        return <Schedule />;
      default:
        return <Collection />;
    }
  }

  private get loginPage() {
    return (
      <LoginPage />
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
    return this.props.isFetchDataSuccess ? this.mainPanel : this.loginPage;
  }
}

const mapStateToProps = (state: State): AppStateProps => {
  const { collapsed, activeModule } = state.uiState.appUIState;
  const isFetchDataSuccess = state.userState.loginState.status !== RequestStatus.failed &&
    state.collectionState.fetchCollectionState.status === RequestStatus.success &&
    state.localDataState.fetchLocalDataState.status === RequestStatus.success;
  return {
    collapsed,
    activeModule,
    isFetchDataSuccess
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): AppDispatchProps => {
  return {
    updateLeftPanelStatus: (collapsed, activeModule) => dispatch(actionCreator(UpdateLeftPanelType, { collapsed, activeModule }))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
