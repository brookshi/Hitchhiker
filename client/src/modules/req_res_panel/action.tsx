
export const activeTabType = 'active_tab_type';

export const activeTabAction = (key: string) => {
    return {
        type: activeTabType,
        key: key
    }
}