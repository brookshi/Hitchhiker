import React from 'react';
import './style/index.less';

interface TabDotProps {

    show: boolean;

    important?: boolean;
}

interface TablWithDotProps extends TabDotProps {

    content: string;
}

export function TabWithDot(props: TablWithDotProps) {
    return (
        <div className="tab-dot-parent">
            {props.content}
            <TabDot show={props.show} important={props.important} />
        </div>
    );
}

export function TabDot(props: TabDotProps) {
    return props.show ? (
        <span className={`tab-dot ${props.important ? 'tab-dot-red' : ''}`}></span>
    ) : null;
}