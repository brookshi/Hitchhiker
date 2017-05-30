import React from 'react';
import { connect, Dispatch } from 'react-redux';

interface HeaderStateProps { }

interface HeaderDispatchProps { }

type HeaderProps = HeaderStateProps & HeaderDispatchProps;

interface HeaderState { }

class Header extends React.Component<HeaderProps, HeaderState> {
    public render() {
        return (
            <div>

            </div>
        );
    }
}

const mapStateToProps = (state: any): HeaderStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): HeaderDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Header);
