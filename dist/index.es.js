import { VPCExpection } from '@xservice/server';

let UTF8_ACCEPT = 12;
let UTF8_REJECT = 0;
let UTF8_DATA = [
    // The first part of the table maps bytes to character to a transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
    10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    // The second part of the table maps a state to a new state when adding a
    // transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96,
    0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // The third part maps the current transition to a mask that needs to apply
    // to the byte.
    0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07
];
function decodeURIComponent(uri) {
    var percentPosition = uri.indexOf('%');
    if (percentPosition === -1)
        return uri;
    var length = uri.length;
    var decoded = '';
    var last = 0;
    var codepoint = 0;
    var startOfOctets = percentPosition;
    var state = UTF8_ACCEPT;
    while (percentPosition > -1 && percentPosition < length) {
        var high = hexCodeToInt(uri[percentPosition + 1], 4);
        var low = hexCodeToInt(uri[percentPosition + 2], 0);
        var byte = high | low;
        var type = UTF8_DATA[byte];
        state = UTF8_DATA[256 + state + type];
        codepoint = (codepoint << 6) | (byte & UTF8_DATA[364 + type]);
        if (state === UTF8_ACCEPT) {
            decoded += uri.slice(last, startOfOctets);
            decoded += (codepoint <= 0xFFFF)
                ? String.fromCharCode(codepoint)
                : String.fromCharCode((0xD7C0 + (codepoint >> 10)), (0xDC00 + (codepoint & 0x3FF)));
            codepoint = 0;
            last = percentPosition + 3;
            percentPosition = startOfOctets = uri.indexOf('%', last);
        }
        else if (state === UTF8_REJECT) {
            return null;
        }
        else {
            percentPosition += 3;
            if (percentPosition < length && uri.charCodeAt(percentPosition) === 37)
                continue;
            return null;
        }
    }
    return decoded + uri.slice(last);
}
var HEX = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'a': 10,
    'A': 10,
    'b': 11,
    'B': 11,
    'c': 12,
    'C': 12,
    'd': 13,
    'D': 13,
    'e': 14,
    'E': 14,
    'f': 15,
    'F': 15
};
function hexCodeToInt(c, shift) {
    var i = HEX[c];
    return i === undefined ? 255 : i << shift;
}

const HttpMethods = ['ROUTER', 'GET', 'POST', 'PUT', 'DELETE'];
var types;
(function (types) {
    types[types["STATIC"] = 0] = "STATIC";
    types[types["PARAM"] = 1] = "PARAM";
    types[types["MATCH_ALL"] = 2] = "MATCH_ALL";
    types[types["REGEX"] = 3] = "REGEX";
    // It's used for a parameter, that is followed by another parameter in the same part
    types[types["MULTI_PARAM"] = 4] = "MULTI_PARAM";
})(types || (types = {}));
class Handlers {
    constructor(handlers) {
        this.ROUTER = null;
        this.GET = null;
        this.POST = null;
        this.PUT = null;
        this.DELETE = null;
        handlers = handlers || {};
        for (let i = 0; i < HttpMethods.length; i++) {
            const m = HttpMethods[i];
            this[m] = handlers[m] || null;
        }
    }
}
class Node {
    constructor(options = {}) {
        this.prefix = options.prefix || '/';
        this.label = this.prefix[0];
        this.children = options.children || {};
        this.numberOfChildren = Object.keys(this.children).length;
        this.kind = options.kind || this.types.STATIC;
        this.handlers = new Handlers(options.handlers);
        this.regex = options.regex || null;
        this.wildcardChild = null;
        this.parametricBrother = null;
    }
    get types() {
        return types;
    }
    getLabel() {
        return this.prefix[0];
    }
    addChild(node) {
        let label = '';
        switch (node.kind) {
            case this.types.STATIC:
                label = node.getLabel();
                break;
            case this.types.PARAM:
            case this.types.REGEX:
            case this.types.MULTI_PARAM:
                label = ':';
                break;
            case this.types.MATCH_ALL:
                this.wildcardChild = node;
                label = '*';
                break;
            default: throw new Error(`Unknown node kind: ${node.kind}`);
        }
        if (this.children[label] !== undefined) {
            throw new Error(`There is already a child with label '${label}'`);
        }
        this.children[label] = node;
        this.numberOfChildren = Object.keys(this.children).length;
        const labels = Object.keys(this.children);
        let parametricBrother = this.parametricBrother;
        for (let i = 0; i < labels.length; i++) {
            const child = this.children[labels[i]];
            if (child.label === ':') {
                parametricBrother = child;
                break;
            }
        }
        const iterate = (node) => {
            if (!node)
                return;
            if (node.kind !== this.types.STATIC)
                return;
            if (node !== this) {
                node.parametricBrother = parametricBrother || node.parametricBrother;
            }
            const labels = Object.keys(node.children);
            for (let i = 0; i < labels.length; i++) {
                iterate(node.children[labels[i]]);
            }
        };
        iterate(this);
        return this;
    }
    reset(prefix) {
        this.prefix = prefix;
        this.children = {};
        this.kind = this.types.STATIC;
        this.handlers = new Handlers();
        this.numberOfChildren = 0;
        this.regex = null;
        this.wildcardChild = null;
        return this;
    }
    findByLabel(path) {
        return this.children[path[0]];
    }
    findChild(path, method) {
        let child = this.findByLabel(path);
        if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null)) {
            if (path.slice(0, child.prefix.length) === child.prefix)
                return child;
        }
        child = this.children[':'] || this.children['*'];
        if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null))
            return child;
        return null;
    }
    setHandler(method, handler, params) {
        if (!handler)
            return;
        if (this.handlers[method] === undefined)
            throw new Error(`There is already an handler with method '${method}'`);
        this.handlers[method] = {
            handler: handler,
            params: params,
            paramsLength: params.length
        };
    }
    getHandler(method) {
        return this.handlers[method];
    }
}

const NODE_TYPES = types;
const httpMethods = HttpMethods;
const FULL_PATH_REGEXP = /^https?:\/\/.*\//;
class CustomStatusError extends VPCExpection {
}
class Router {
    constructor(opts = {}) {
        this.defaultRoute = opts.defaultRoute || null;
        this.caseSensitive = opts.caseSensitive === undefined ? true : opts.caseSensitive;
        this.ignoreTrailingSlash = opts.ignoreTrailingSlash || false;
        this.maxParamLength = opts.maxParamLength || 100;
        this.tree = new Node();
        this.routes = [];
    }
    on(method, path, opts, handler) {
        if (typeof opts === 'function') {
            handler = opts;
            opts = {};
        }
        if (typeof path !== 'string')
            throw new Error('Path should be a string');
        if (path.length === 0)
            throw new Error('The path could not be empty');
        if (path[0] !== '/' && path[0] !== '*')
            throw new Error('The first character of a path should be `/` or `*`');
        if (typeof handler !== 'function')
            throw new Error('Handler should be a function');
        this._on(method, path, opts, handler);
        if (this.ignoreTrailingSlash && path !== '/' && !path.endsWith('*')) {
            if (path.endsWith('/')) {
                this._on(method, path.slice(0, -1), opts, handler);
            }
            else {
                this._on(method, path + '/', opts, handler);
            }
        }
    }
    _on(method, path, opts, handler) {
        if (Array.isArray(method)) {
            for (let k = 0; k < method.length; k++) {
                this._on(method[k], path, opts, handler);
            }
            return;
        }
        if (typeof method !== 'string')
            throw new Error('Method should be a string');
        if (httpMethods.indexOf(method) === -1)
            throw new Error(`Method '${method}' is not an http method.`);
        const params = [];
        let j = 0;
        this.routes.push({
            method: method,
            path: path,
            opts: opts,
            handler: handler
        });
        for (let i = 0, len = path.length; i < len; i++) {
            // search for parametric or wildcard routes
            // parametric route
            if (path.charCodeAt(i) === 58) {
                let nodeType = NODE_TYPES.PARAM;
                j = i + 1;
                let staticPart = path.slice(0, i);
                if (this.caseSensitive === false) {
                    staticPart = staticPart.toLowerCase();
                }
                // add the static part of the route to the tree
                this._insert(method, staticPart, 0);
                // isolate the parameter name
                let isRegex = false;
                while (i < len && path.charCodeAt(i) !== 47) {
                    isRegex = isRegex || path[i] === '(';
                    if (isRegex) {
                        i = getClosingParenthensePosition(path, i) + 1;
                        break;
                    }
                    else if (path.charCodeAt(i) !== 45) {
                        i++;
                    }
                    else {
                        break;
                    }
                }
                if (isRegex && (i === len || path.charCodeAt(i) === 47)) {
                    nodeType = NODE_TYPES.REGEX;
                }
                else if (i < len && path.charCodeAt(i) !== 47) {
                    nodeType = NODE_TYPES.MULTI_PARAM;
                }
                let parameter = path.slice(j, i);
                let regex = isRegex ? new RegExp(parameter.slice(parameter.indexOf('('), i)) : undefined;
                params.push(parameter.slice(0, isRegex ? parameter.indexOf('(') : i));
                path = path.slice(0, j) + path.slice(i);
                i = j;
                len = path.length;
                // if the path is ended
                if (i === len) {
                    let completedPath = path.slice(0, i);
                    if (this.caseSensitive === false) {
                        completedPath = completedPath.toLowerCase();
                    }
                    return this._insert(method, completedPath, nodeType, params, handler, regex);
                }
                // add the parameter and continue with the search
                this._insert(method, path.slice(0, i), nodeType, params, undefined, regex);
                i--;
            }
            else if (path.charCodeAt(i) === 42) {
                this._insert(method, path.slice(0, i), 0);
                // add the wildcard parameter
                params.push('*');
                return this._insert(method, path.slice(0, len), 2, params, handler);
            }
        }
        if (this.caseSensitive === false) {
            path = path.toLowerCase();
        }
        // static route
        this._insert(method, path, 0, params, handler);
    }
    _insert(method, path, kind, params = [], handler, regex) {
        const route = path;
        let currentNode = this.tree;
        let prefix = '';
        let pathLen = 0;
        let prefixLen = 0;
        let len = 0;
        let max = 0;
        let node = null;
        while (true) {
            prefix = currentNode.prefix;
            prefixLen = prefix.length;
            pathLen = path.length;
            len = 0;
            // search for the longest common prefix
            max = pathLen < prefixLen ? pathLen : prefixLen;
            while (len < max && path[len] === prefix[len])
                len++;
            // the longest common prefix is smaller than the current prefix
            // let's split the node and add a new child
            if (len < prefixLen) {
                node = new Node({ prefix: prefix.slice(len),
                    children: currentNode.children,
                    kind: currentNode.kind,
                    handlers: new Handlers(currentNode.handlers),
                    regex: currentNode.regex });
                if (currentNode.wildcardChild !== null) {
                    node.wildcardChild = currentNode.wildcardChild;
                }
                // reset the parent
                currentNode
                    .reset(prefix.slice(0, len))
                    .addChild(node);
                // if the longest common prefix has the same length of the current path
                // the handler should be added to the current node, to a child otherwise
                if (len === pathLen) {
                    if (currentNode.getHandler(method)) {
                        throw new Error(`Method '${method}' already declared for route '${route}'`);
                    }
                    currentNode.setHandler(method, handler, params);
                    currentNode.kind = kind;
                }
                else {
                    node = new Node({
                        prefix: path.slice(len),
                        kind: kind,
                        handlers: null,
                        regex: regex
                    });
                    node.setHandler(method, handler, params);
                    currentNode.addChild(node);
                }
                // the longest common prefix is smaller than the path length,
                // but is higher than the prefix
            }
            else if (len < pathLen) {
                // remove the prefix
                path = path.slice(len);
                // check if there is a child with the label extracted from the new path
                node = currentNode.findByLabel(path);
                // there is a child within the given label, we must go deepen in the tree
                if (node) {
                    currentNode = node;
                    continue;
                }
                // there are not children within the given label, let's create a new one!
                node = new Node({ prefix: path, kind: kind, handlers: null, regex: regex });
                node.setHandler(method, handler, params);
                currentNode.addChild(node);
                // the node already exist
            }
            else if (handler) {
                if (currentNode.getHandler(method)) {
                    throw new Error(`Method '${method}' already declared for route '${route}'`);
                }
                currentNode.setHandler(method, handler, params);
            }
            return;
        }
    }
    reset() {
        this.tree = new Node();
        this.routes = [];
    }
    off(method, path) {
        let self = this;
        if (Array.isArray(method)) {
            return method.map(method => self.off(method, path));
        }
        // method validation
        if (typeof method !== 'string')
            throw new Error('Method should be a string');
        if (httpMethods.indexOf(method) === -1)
            throw new Error(`Method '${method}' is not an http method.`);
        // path validation
        if (typeof path !== 'string')
            throw new Error('Path should be a string');
        if (path.length === 0)
            throw new Error('The path could not be empty');
        if (path[0] !== '/' && path[0] !== '*')
            throw new Error('The first character of a path should be `/` or `*`');
        // Rebuild tree without the specific route
        const ignoreTrailingSlash = this.ignoreTrailingSlash;
        let newRoutes = self.routes.filter(route => {
            if (!ignoreTrailingSlash) {
                return !(method === route.method && path === route.path);
            }
            if (path.endsWith('/')) {
                const routeMatches = path === route.path || path.slice(0, -1) === route.path;
                return !(method === route.method && routeMatches);
            }
            const routeMatches = path === route.path || (path + '/') === route.path;
            return !(method === route.method && routeMatches);
        });
        if (ignoreTrailingSlash) {
            newRoutes = newRoutes.filter((route, i, ar) => {
                if (route.path.endsWith('/') && i < ar.length - 1) {
                    return route.path.slice(0, -1) !== ar[i + 1].path;
                }
                else if (route.path.endsWith('/') === false && i < ar.length - 1) {
                    return (route.path + '/') !== ar[i + 1].path;
                }
                return true;
            });
        }
        self.reset();
        newRoutes.forEach(route => self.on(route.method, route.path, route.opts, route.handler));
    }
    async lookup(ctx) {
        const handle = this.find(ctx.method.toUpperCase(), sanitizeUrl(ctx.req.pathname));
        if (handle === null)
            return await this._defaultRoute(ctx);
        Object.assign(ctx.params, handle.params);
        return await handle.handler(ctx);
    }
    async _defaultRoute(ctx) {
        if (this.defaultRoute !== null) {
            return await Promise.resolve(this.defaultRoute(ctx));
        }
        else {
            throw new CustomStatusError('Not found', 404);
        }
    }
    router(path, handler) {
        return this.on('ROUTER', path, handler);
    }
    get(path, handler) {
        return this.on('GET', path, handler);
    }
    post(path, handler) {
        return this.on('POST', path, handler);
    }
    put(path, handler) {
        return this.on('PUT', path, handler);
    }
    delete(path, handler) {
        return this.on('DELETE', path, handler);
    }
    all(path, handler) {
        return this.on(httpMethods, path, handler);
    }
    find(method, path) {
        if (path.charCodeAt(0) !== 47) { // 47 is '/'
            path = path.replace(FULL_PATH_REGEXP, '/');
        }
        let originalPath = path;
        let originalPathLength = path.length;
        if (this.caseSensitive === false) {
            path = path.toLowerCase();
        }
        let maxParamLength = this.maxParamLength;
        let currentNode = this.tree;
        let wildcardNode = null;
        let pathLenWildcard = 0;
        let decoded = null;
        let pindex = 0;
        let params = [];
        let i = 0;
        let idxInOriginalPath = 0;
        while (true) {
            let pathLen = path.length;
            let prefix = currentNode.prefix;
            let prefixLen = prefix.length;
            let len = 0;
            let previousPath = path;
            // found the route
            if (pathLen === 0 || path === prefix) {
                let handle = currentNode.handlers[method];
                if (handle !== null && handle !== undefined) {
                    let paramsObj = {};
                    if (handle.paramsLength > 0) {
                        let paramNames = handle.params;
                        for (i = 0; i < handle.paramsLength; i++) {
                            paramsObj[paramNames[i]] = params[i];
                        }
                    }
                    return {
                        handler: handle.handler,
                        params: paramsObj,
                    };
                }
            }
            // search for the longest common prefix
            i = pathLen < prefixLen ? pathLen : prefixLen;
            while (len < i && path.charCodeAt(len) === prefix.charCodeAt(len))
                len++;
            if (len === prefixLen) {
                path = path.slice(len);
                pathLen = path.length;
                idxInOriginalPath += len;
            }
            let node = currentNode.findChild(path, method);
            if (node === null) {
                node = currentNode.parametricBrother;
                if (node === null) {
                    return getWildcardNode(wildcardNode, method, originalPath, pathLenWildcard);
                }
                if (originalPath.indexOf('/' + previousPath) === -1) {
                    // we need to know the outstanding path so far from the originalPath since the last encountered "/" and assign it to previousPath.
                    // e.g originalPath: /aa/bbb/cc, path: bb/cc
                    // outstanding path: /bbb/cc
                    let pathDiff = originalPath.slice(0, originalPathLength - pathLen);
                    previousPath = pathDiff.slice(pathDiff.lastIndexOf('/') + 1, pathDiff.length) + path;
                }
                idxInOriginalPath = idxInOriginalPath - (previousPath.length - path.length);
                path = previousPath;
                pathLen = previousPath.length;
                len = prefixLen;
            }
            let kind = node.kind;
            // static route
            if (kind === NODE_TYPES.STATIC) {
                // if exist, save the wildcard child
                if (currentNode.wildcardChild !== null) {
                    wildcardNode = currentNode.wildcardChild;
                    pathLenWildcard = pathLen;
                }
                currentNode = node;
                continue;
            }
            if (len !== prefixLen) {
                return getWildcardNode(wildcardNode, method, originalPath, pathLenWildcard);
            }
            // if exist, save the wildcard child
            if (currentNode.wildcardChild !== null) {
                wildcardNode = currentNode.wildcardChild;
                pathLenWildcard = pathLen;
            }
            // parametric route
            if (kind === NODE_TYPES.PARAM) {
                currentNode = node;
                i = path.indexOf('/');
                if (i === -1)
                    i = pathLen;
                if (i > maxParamLength)
                    return null;
                decoded = decodeURIComponent(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i));
                if (decoded === null)
                    return null;
                params[pindex++] = decoded;
                path = path.slice(i);
                idxInOriginalPath += i;
                continue;
            }
            // wildcard route
            if (kind === NODE_TYPES.MATCH_ALL) {
                decoded = decodeURIComponent(originalPath.slice(idxInOriginalPath));
                if (decoded === null)
                    return null;
                params[pindex] = decoded;
                currentNode = node;
                path = '';
                continue;
            }
            // parametric(regex) route
            if (kind === NODE_TYPES.REGEX) {
                currentNode = node;
                i = path.indexOf('/');
                if (i === -1)
                    i = pathLen;
                if (i > maxParamLength)
                    return null;
                decoded = decodeURIComponent(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i));
                if (decoded === null)
                    return null;
                if (!node.regex.test(decoded))
                    return null;
                params[pindex++] = decoded;
                path = path.slice(i);
                idxInOriginalPath += i;
                continue;
            }
            // multiparametric route
            if (kind === NODE_TYPES.MULTI_PARAM) {
                currentNode = node;
                i = 0;
                if (node.regex !== null) {
                    let matchedParameter = path.match(node.regex);
                    if (matchedParameter === null)
                        return null;
                    i = matchedParameter[1].length;
                }
                else {
                    while (i < pathLen && path.charCodeAt(i) !== 47 && path.charCodeAt(i) !== 45)
                        i++;
                    if (i > maxParamLength)
                        return null;
                }
                decoded = decodeURIComponent(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i));
                if (decoded === null)
                    return null;
                params[pindex++] = decoded;
                path = path.slice(i);
                idxInOriginalPath += i;
                continue;
            }
            wildcardNode = null;
        }
    }
}
function sanitizeUrl(url) {
    for (let i = 0, len = url.length; i < len; i++) {
        let charCode = url.charCodeAt(i);
        // Some systems do not follow RFC and separate the path and query
        // string with a `;` character (code 59), e.g. `/foo;jsessionid=123456`.
        // Thus, we need to split on `;` as well as `?` and `#`.
        if (charCode === 63 || charCode === 59 || charCode === 35) {
            return url.slice(0, i);
        }
    }
    return url;
}
function getWildcardNode(node, method, path, len) {
    if (node === null)
        return null;
    let decoded = decodeURIComponent(path.slice(-len));
    if (decoded === null)
        return null;
    let handle = node.handlers[method];
    if (handle !== null && handle !== undefined) {
        return {
            handler: handle.handler,
            params: { '*': decoded },
        };
    }
    return null;
}
function getClosingParenthensePosition(path, idx) {
    // `path.indexOf()` will always return the first position of the closing parenthese,
    // but it's inefficient for grouped or wrong regexp expressions.
    // see issues #62 and #63 for more info
    let parentheses = 1;
    while (idx < path.length) {
        idx++;
        // ignore skipped chars
        if (path[idx] === '\\') {
            idx++;
            continue;
        }
        if (path[idx] === ')') {
            parentheses--;
        }
        else if (path[idx] === '(') {
            parentheses++;
        }
        if (!parentheses)
            return idx;
    }
    throw new TypeError('Invalid regexp expression in "' + path + '"');
}

export default Router;
export { CustomStatusError };
