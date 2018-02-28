import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function (msgID: string) {
    return (
        <FormattedMessage id={msgID} />
    );
}