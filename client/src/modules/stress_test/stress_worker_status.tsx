import React from 'react';
import './style/index.less';
import { WorkerInfo } from '../../../../api/src/interfaces/dto_stress_setting';
import Indicator from '../../components/indicator';
import { State } from '../../state/index';
import { connect } from 'react-redux';
import Msg from '../../locales';
import LocalesString from '../../locales/string';

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
                {workerInfos.map((w, i) => <Indicator key={w.addr} left={i > 0 ? 8 : 0} status={w.status} name={`${this.localhostConverter(w.addr)} (${w.cpuNum} Cores)`} />)}
                <span className="stress-worker-gap" />
                <span className="stress-task">{Msg('Stress.TaskCount')}: {taskCount} {currentTask ? `, ${LocalesString.get('Stress.CurrentTask')}: ${currentTask}` : ''}</span>
            </div>
        );
    }

    private localhostConverter = (addr: string) => {
        if (addr === '::1' || addr.endsWith('127.0.0.1')) {
            return 'localhost';
        } else if (addr.startsWith('::ffff:')) {
            return addr.substr(7);
        }
        return addr;
    }
}

const mapStateToProps = (state: State): StressWorkerStatusProps => {
    return {
        workerInfos: state.stressTestState.workerInfos,
        taskCount: state.stressTestState.tasks.length,
        currentTask: state.stressTestState.currentRunStressName
    };
};

const mapDispatchToProps = (): StressWorkerStatusDispatchProps => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StressWorkerStatus);