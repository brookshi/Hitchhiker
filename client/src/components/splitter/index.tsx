import React from 'react';
import Config from '../../common/config';
import './style/index.less';

interface SplitterProps {

    resizeCollectionPanel(width: number);
}

interface SplitterState { }

class Splitter extends React.Component<SplitterProps, SplitterState> {

    private onSplitterMove = (e) => {
        e.preventDefault();
        const width = Math.min(Math.max(e.clientX - Config.ToolBarWidth, Config.MinLeftPanelWidth), Config.MaxLeftPanelWidth);
        this.props.resizeCollectionPanel(width);
    }

    private onSplitterMouseDown = (e) => {
        if (e.button !== 0) {
            return;
        }
        document.addEventListener('mousemove', this.onSplitterMove);
        document.addEventListener('mouseup', this.onSplitterMouseUp);
        e.preventDefault();
    }

    private onSplitterMouseUp = (e) => {
        document.removeEventListener('mousemove', this.onSplitterMove);
        document.removeEventListener('mouseup', this.onSplitterMouseUp);
        e.preventDefault();
    }

    public render() {
        return (
            <div className="splitter" onMouseDown={this.onSplitterMouseDown} />
        );
    }
}

export default Splitter;