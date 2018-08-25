export class UserVariableManager {

    static variables: _.Dictionary<any> = {};

    static cookies: _.Dictionary<_.Dictionary<_.Dictionary<string>>> = {};

    static getVariables(vid: string, envId: string) {
        if (vid && !UserVariableManager.variables[vid]) {
            UserVariableManager.variables[vid] = {};
        }
        if (envId && !UserVariableManager.variables[vid][envId]) {
            UserVariableManager.variables[vid][envId] = {};
        }
        return vid ? UserVariableManager.variables[vid][envId] : {};
    }

    static clearVariables(vid: string) {
        if (!vid) {
            return;
        }
        Reflect.deleteProperty(UserVariableManager.variables, vid);
    }

    static getCookies(vid: string, envId: string) {
        if (vid && !UserVariableManager.cookies[vid]) {
            UserVariableManager.cookies[vid] = {};
        }
        if (envId && !UserVariableManager.cookies[vid][envId]) {
            UserVariableManager.cookies[vid][envId] = {};
        }
        return vid ? UserVariableManager.cookies[vid][envId] : {};
    }

    static clearCookies(vid: string) {
        if (!vid) {
            return;
        }
        Reflect.deleteProperty(UserVariableManager.cookies, vid);
    }
}