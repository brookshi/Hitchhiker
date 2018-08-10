import appLocaleDataEn from 'react-intl/locale-data/en';
import appLocaleDataZh from 'react-intl/locale-data/zh';
const enMessages = require('./en');
const zhMessages = require('./zh');

export const language = {
    en: {
        messages: {
            ...enMessages,
        },
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