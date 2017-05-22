import React from 'react';

interface TeamStateProps { }

interface TeamDispatchProps { }

interface TeamOtherProps { }

type TeamProps = TeamStateProps & TeamDispatchProps & TeamOtherProps;

interface TeamState { }

class Team extends React.Component<TeamProps, TeamState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default Team;