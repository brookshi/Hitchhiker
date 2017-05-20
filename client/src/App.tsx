import * as React from 'react';
import './style/App.less';
import CollectionList from './modules/collection_tree';
import { Layout, Menu, Icon } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ReqResPanel from './modules/req_res_panel';
import './style/perfect-scrollbar.min.css';

const { Header, Content, Sider } = Layout;

interface AppState {
  collapsed: boolean;

  mode: 'inline' | 'vertical';

  selectedKeys: string[];

  collectionPanelWidth: number;
}

class App extends React.Component<{}, AppState> {

  private minCollectionWidth = 100;
  private maxCollectionWidth = 600;
  private toolBarWidth = 50;
  private isResizing: boolean;

  constructor(props: {}) {
    super(props);
    this.isResizing = false;
    this.state = {
      collapsed: false,
      mode: 'inline',
      selectedKeys: ['1'],
      collectionPanelWidth: 300
    };
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
    this.setState({ ...this.state, collectionPanelWidth: width });
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
                <Icon type="wallet" />
              </Menu.Item>
              <Menu.Item key="2">
                <Icon type="team" />
              </Menu.Item>
              <Menu.Item key="3">
                <Icon type="schedule" />
              </Menu.Item>
              <Menu.Item key="4">
                <Icon type="file-text" />
              </Menu.Item>
              <Menu.Item key="5">
                <Icon type="api" />
              </Menu.Item>
              <Menu.Item key="6">
                <Icon type="code-o" />
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout className="main-panel">
            <Sider
              className="collection-sider"
              style={{ minWidth: this.state.collapsed ? 0 : this.state.collectionPanelWidth }}
              collapsible={true}
              collapsedWidth="0.1"
              collapsed={this.state.collapsed}
              onCollapse={this.onCollapse}>
              <PerfectScrollbar>
                <CollectionList />
              </PerfectScrollbar>
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

export default App;
