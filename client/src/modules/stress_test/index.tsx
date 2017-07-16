import React from 'react';
import { connect, Dispatch } from 'react-redux';

interface StressTestStateProps { }

interface StressTestDispatchProps { }

type StressTestProps = StressTestStateProps & StressTestDispatchProps;

interface StressTestState { }

class StressTest extends React.Component<StressTestProps, StressTestState> {
    public render() {
        return (
            <div className="taken-sentence">
                <div>Keep your friends close，but your enemies closer.</div>
                <div>-- The Godfather</div>
            </div>
        );
    }
}

const mapStateToProps = (state: any): StressTestStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): StressTestDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StressTest);