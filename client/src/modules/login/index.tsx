import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Row, Col } from 'antd';
import './style/index.less';

interface LoginPanelStateProps { }

interface LoginPanelDispatchProps { }

type LoginPanelProps = LoginPanelStateProps & LoginPanelDispatchProps;

interface LoginPanelState { }

class LoginPanel extends React.Component<LoginPanelProps, LoginPanelState> {
    public render() {
        return (
            <div className="login-panel">
                <Row style={{ height: '80%' }} type="flex" justify="center" align="middle">
                    <Col span={12}>
                        <div className="login-panel-desc-title">Api management for team</div>
                        <div className="login-panel-desc-content">
                            Hitchhiker is an <b><a target="blank" href="https://github.com/brookshi/hitchhiker">open source</a></b> Restful Api management platform. You can deploy it in your local server, then create your team, invite members to join, and create, maintain Api together.<br /><br />
                            More useful feathers (Schedule, Document etc.) are coming soon.
                    </div>
                    </Col>
                    <Col span={7}>
                        login panel
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: any): LoginPanelStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): LoginPanelDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LoginPanel);