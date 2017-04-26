import * as React from 'react';
import './App.less';
// import CollectionList from './components/collection_list';
// import { Layout, Menu, Icon } from 'antd';

// const { Header, Content, Sider } = Layout;
import HttpMethodIcon from './components/font_icon/http_method_icon';
class App extends React.Component<{}, null> {

  render() {
    return (
      /*<Layout className="layout">
        <Header>
        </Header>
        <Layout>
          <Sider style={{ 'max-width': 50 }}>
            <Menu className="sider-menu" mode="vertical" theme="dark" defaultSelectedKeys={['1']}>
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
            <Sider style={{ 'min-width': 300 }}>
              <CollectionList />
            </Sider>
            <Content>

            </Content>
          </Layout>
        </Layout>
      </Layout>*/
      <div style={{ width: 100, height: 200, display: 'flex' }}>
        <HttpMethodIcon httpMethod='GET' />
        {/*<br />
        <HttpMethodIcon httpMethod='POST' />
        <br />
        <HttpMethodIcon httpMethod='PUT' />
        <br />
        <HttpMethodIcon httpMethod='PATCH' />
        <br />
        <HttpMethodIcon httpMethod='DELETE' />
        <br />
        <HttpMethodIcon httpMethod='123' />*/}
      </div>
    );
  }
}

export default App;
