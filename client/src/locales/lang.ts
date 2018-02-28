import antdEn from 'antd/lib/locale-provider/en_US';
import appLocaleDataEn from 'react-intl/locale-data/en';
import appLocaleDataZh from 'react-intl/locale-data/zh';
const enMessages = require('./en');
const zhMessages = require('./zh');

export const language = {
    en: {
        messages: {
            ...enMessages,
        },
        antd: antdEn,
        locale: 'en-US',
        data: appLocaleDataEn
    },
    zh: {
        messages: {
            ...zhMessages,
        },
        antd: {},
        locale: 'zh-Hans-CN',
        data: appLocaleDataZh
    }
};