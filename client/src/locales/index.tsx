import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function (msgID: string, values?: any) {
    return (
        <FormattedMessage id={msgID} values={values} />
    );
}