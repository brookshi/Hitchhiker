import React from 'react';
import './style/index.less';
import { WorkerInfo } from '../../../../api/interfaces/dto_stress_setting';
import Indicator from '../../components/indicator';
import { State } from '../../state/index';
import { connect, Dispatch } from 'react-redux';

interface StressWorkerStatusProps {

    workerInfos: WorkerInfo[];

    taskCount: number;

    currentTask: string;
}

interface StressWorkerStatusDispatchProps { }

type StressWorkerProps = StressWorkerStatusProps & StressWorkerStatusDispatchProps;

interface StressWorkerStatusState { }

class StressWorkerStatus extends React.Component<StressWorkerProps, StressWorkerStatusState> {
    public render() {
        const { workerInfos, taskCount, currentTask } = this.props;
        return (
            <div className="stress-worker-status">
                {workerInfos.map(w => <Indicator key={w.addr} status={w.status} name={`${this.localhostConverter(w.addr)} (${w.cpuNum} Cores)`} />)}
                <span className="stress-worker-gap" />
                <span className="stress-task">Task Count: {taskCount} {currentTask ? `, Current Task: ${currentTask}` : ''}</span>
            </div>
        );
    }

    private localhostConverter = (addr: string) => {
        if (addr === '::1') {
            return 'localhost';
        }
        return addr;
    }
}

const mapStateToProps = (state: State): StressWorkerStatusProps => {
    return {
        workerInfos: state.stressTestState.workerInfos,
        taskCount: state.stressTestState.tasks.length,
        currentTask: state.stressTestState.currentRunStress
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): StressWorkerStatusDispatchProps => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StressWorkerStatus);