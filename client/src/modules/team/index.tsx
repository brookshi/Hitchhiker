import React from 'react';
import { connect, Dispatch } from 'react-redux';

interface TeamStateProps { }

interface TeamDispatchProps { }

type TeamProps = TeamStateProps & TeamDispatchProps;

interface TeamState { }

class Team extends React.Component<TeamProps, TeamState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

const mapStateToProps = (state: any): TeamStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): TeamDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Team);