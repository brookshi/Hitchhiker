import * as React from 'react';
import { Layout, Menu, Icon, Button } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import Collection from './modules/collection';
import Project from './modules/project';
import Schedule from './modules/schedule';
import HeaderPanel from './modules/header';
import StressTest from './modules/stress_test';
import ApiDocument from './modules/document';
import ApiMock from './modules/api_mock';
import './style/perfect-scrollbar.min.css';
import { State } from './state';
import { connect } from 'react-redux';
import { actionCreator } from './action';
import { UpdateLeftPanelType } from './action/ui';
import LoginPage from './modules/login';
import { RequestStatus } from './misc/request_status';
// import Perf from 'react-addons-perf';
import './style/App.less';
import * as _ from 'lodash';
import Msg from './locales';
import { injectIntl } from 'react-intl';
import LocalesString from './locales/string';

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
    LocalesString.intl = props['intl'];
    // (window as any).Perf = Perf;
  }

  shouldComponentUpdate(nextProps: AppProps, nextState: AppState) {
    return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
  }

  private onClick = (param: ClickParam) => {
    const { collapsed, activeModule, updateLeftPanelStatus } = this.props;
    if (activeModule === param.key) {
      updateLeftPanelStatus(!collapsed, activeModule);
    } else {
      updateLeftPanelStatus(false, param.key);
    }
  }

  private activeModule = () => {
    switch (this.props.activeModule) {
      case 'collection':
        return <Collection />;
      case 'project':
        return <Project />;
      case 'schedule':
        return <Schedule />;
      case 'stress_test':
        return <StressTest />;
      case 'api_doc':
        return <ApiDocument />;
      case 'api_mock':
        return <ApiMock />;
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
          <Sider className="app-slider" collapsible={true} collapsed={true} collapsedWidth={50}>
            <Menu
              className="sider-menu"
              mode="vertical"
              theme="dark"
              selectedKeys={[this.props.activeModule]}
              onClick={this.onClick}
            >
              <Menu.Item key="collection">
                <Icon type="wallet" />
                {Msg('App.Collections')}
              </Menu.Item>
              <Menu.Item key="project">
                <Icon type="solution" />
                {Msg('App.Project')}
              </Menu.Item>
              <Menu.Item key="schedule">
                <Icon type="schedule" />
                {Msg('App.Scheduler')}
              </Menu.Item>
              <Menu.Item key="stress_test">
                <Icon type="code-o" />
                {Msg('App.StressTest')}
              </Menu.Item>
              <Menu.Item key="api_doc">
                <Icon type="file-text" />
                {Msg('App.ApiDocument')}
              </Menu.Item>
              <Menu.Item key="api_mock">
                <Icon type="api" />
                {Msg('App.Mock')}
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
    state.localDataState.fetchLocalDataState.status === RequestStatus.success;
  return {
    collapsed,
    activeModule,
    isFetchDataSuccess
  };
};

const mapDispatchToProps = (dispatch: any): AppDispatchProps => {
  return {
    updateLeftPanelStatus: (collapsed, activeModule) => dispatch(actionCreator(UpdateLeftPanelType, { collapsed, activeModule }))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(App));
