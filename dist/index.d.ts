import { TypeMethod } from './node';
import { Context, VPCExpection } from '@xservice/server';
export declare type IHandleType<T extends Context, U = any> = (ctx: T) => Promise<U>;
export declare class CustomStatusError extends VPCExpection {
}
export interface RouterArguments<T extends Context> {
    defaultRoute?: (ctx: T) => void;
    caseSensitive?: boolean;
    ignoreTrailingSlash?: boolean;
    maxParamLength?: number;
}
export default class Router<T extends Context> {
    private defaultRoute;
    private caseSensitive;
    private ignoreTrailingSlash;
    private maxParamLength;
    private tree;
    private routes;
    constructor(opts?: RouterArguments<T>);
    on<U = any>(method: TypeMethod | TypeMethod[], path: string, opts: object | IHandleType<T, U>, handler?: IHandleType<T, U>): void;
    private _on;
    private _insert;
    reset(): void;
    off(method: TypeMethod | Array<TypeMethod>, path: string): any;
    lookup(ctx: T): Promise<any>;
    private _defaultRoute;
    router(path: string, handler: (ctx: T) => Promise<void>): void;
    get(path: string, handler: (ctx: T) => Promise<void>): void;
    post(path: string, handler: (ctx: T) => Promise<void>): void;
    put(path: string, handler: (ctx: T) => Promise<void>): void;
    delete(path: string, handler: (ctx: T) => Promise<void>): void;
    all(path: string, handler: (ctx: T) => Promise<void>): void;
    find(method: TypeMethod, path: string): {
        handler: IHandleType<T, any>;
        params: {
            [key: string]: string;
        };
    };
}
