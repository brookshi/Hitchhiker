import * as React from 'react';
import './style/App.less';
import CollectionList from './modules/collection_tree';
import { Layout, Menu, Icon } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import PerfectScrollbar from 'react-perfect-scrollbar';
import './style/perfect-scrollbar.min.css';

const { Header, Content, Sider } = Layout;

class App extends React.Component<{}, any> {
  state = {
    collapsed: false,
    mode: 'inline',
    selectedKeys: ['1']
  };

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

  render() {
    return (
      <Layout className="layout">
        <Header>
        </Header>
        <Layout>
          <Sider style={{ 'max-width': 50 }}>
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
          <Layout>
            <Sider
              style={{ 'min-width': this.state.collapsed ? 0 : 300, background: 'white' }}
              collapsible
              collapsedWidth="0.1"
              collapsed={this.state.collapsed}
              onCollapse={this.onCollapse}>
              <PerfectScrollbar>
                <CollectionList />
              </PerfectScrollbar>
            </Sider>
            <Content>

            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default App;
