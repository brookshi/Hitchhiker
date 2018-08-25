import React from 'react';
import { WorkerStatus } from '../../misc/stress_type';
import { primaryColor } from '../../style/theme';
import './style/index.less';

interface IndicatorProps {

    status: WorkerStatus;

    name: string;

    left?: number;
}

interface IndicatorState { }

class Indicator extends React.Component<IndicatorProps, IndicatorState> {

    private getColorByStatus = () => {
        switch (this.props.status) {
            case WorkerStatus.idle:
            case WorkerStatus.finish:
                return '#3fb0f0';
            default:
                return primaryColor;
        }
    }

    public render() {
        const { status, name, left } = this.props;
        const color = this.getColorByStatus();
        const style = { background: color, marginLeft: left || 0 };
        return (
            <span>
                <span className={`${status === WorkerStatus.working ? 'indicator-blink' : ''} indicator-round`} style={style} />
                <span className="indicator-name"> {name}</span>
            </span>
        );
    }
}

export default Indicator;