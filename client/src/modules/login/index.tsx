import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Row, Col, Form, Input, Icon, Button } from 'antd';
import './style/index.less';

const FormItem = Form.Item;

interface LoginPanelStateProps { }

interface LoginPanelDispatchProps { }

type LoginPanelProps = LoginPanelStateProps & LoginPanelDispatchProps;

interface LoginPanelState { }

class LoginPanel extends React.Component<LoginPanelProps & any, LoginPanelState> {

    private handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    }

    public render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="login-panel">
                <Row style={{ height: '80%' }} type="flex" justify="center" align="middle" gutter={36}>
                    <Col span={13}>
                        <div style={{ float: 'right', maxWidth: 550 }}>
                            <div className="login-panel-desc-title">Api integrated testing tool for team</div>
                            <div className="login-panel-desc-content">
                                Hitchhiker is an <b><a target="blank" href="https://github.com/brookshi/hitchhiker">open source</a></b> Restful Api integrated testing tool. You can deploy it in your local server. It make easier to manage Api with your team members.<br /><br />
                                More useful feathers (Schedule, Document, Api Mock etc.) will come soon.
                            </div>
                        </div>
                    </Col>
                    <Col span={11}>
                        <Form onSubmit={this.handleSubmit} className="login-panel-form">
                            <FormItem>
                                <div>
                                    Email
                                </div>
                                {
                                    getFieldDecorator('email', {
                                        rules: [{ required: true, message: 'Please enter your email!' }],
                                    })
                                        (
                                        <Input spellCheck={false} className="login-panel-form-input" prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Email" />
                                        )
                                }
                            </FormItem>
                            <FormItem>
                                <div>
                                    Password <a className="login-panel-form-forgot" href="">Forgot password?</a>
                                </div>
                                {
                                    getFieldDecorator('password', {
                                        rules: [{ required: true, message: 'Please enter your Password!' }],
                                    })
                                        (
                                        <Input spellCheck={false} className="login-panel-form-input" prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
                                        )
                                }
                            </FormItem>
                            <FormItem>
                                <Button type="primary" htmlType="submit" className="login-panel-form-button">
                                    Sign in
                                </Button>
                                New to Hitchhier? <a href="">Create an account.</a>
                            </FormItem>
                        </Form>
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

const WrappedNormalLoginForm = Form.create()(LoginPanel);

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(WrappedNormalLoginForm);