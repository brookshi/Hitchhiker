import './style/index.less';
import React from 'react';

export const nameWithTag = (name: string, tag: string, type: 'normal' | 'warning' = 'normal') => (
    <div>
        <span>{name}</span>
        {tag !== '' && tag !== '0' ?
            (
                <span className={type === 'normal' ? 'number-tag-normal' : 'number-tag-warning'}>
                    {`(${tag})`}
                </span>
            ) : ''}
    </div>
);