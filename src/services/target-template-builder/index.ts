import { Liquid } from 'liquidjs';
import { FS } from 'liquidjs/dist/fs/fs';

const templateEngine = new Liquid({
    strictFilters: false,
    strictVariables: false,
    fs: {
        exists: () => Promise.resolve(false),
        resolve: () => ''
    } as unknown as FS
});

async function renderObject(object: object, model: any, baseKey: string = ''): Promise<object> {
    if (!object || typeof object !== 'object') {
        throw Error('template object must be an object');
    }
    const keys = Object.keys(object);
    const result: {[key: string]: any } = {};
    for (const key of keys) {
        result[key] = await renderValue(object[key], model, `${baseKey}/${key}`);
    }
    return result;
}

async function renderValue(value: object | string | number | [], model: any, baseKey: string): Promise<object | string | number | []> {
    if (typeof value === 'string' && value) {
        return renderString(value, model, baseKey);
    } else if (Array.isArray(value)) {
        return await renderArray(value, model, baseKey);
    } else if (value && typeof value === 'object') {
        return await renderObject(value, model, baseKey);
    }
    return value;
}

async function renderString(value: string, model: object, baseKey: string): Promise<string | number> {
    try {
        const renderedValue = await templateEngine.parseAndRender(value, model);
        return canBeConvertedToFloat(renderedValue) ? parseFloat(renderedValue) : renderedValue;
    } catch (error) {
        const { message } = error;
        if (message.includes('ENOENT')) {
            throw Error(`${baseKey} partials and layouts are not supported${message.substring(message.indexOf(', line:'))}`);
        }
        throw Error(`${baseKey} ${message}`);
    }
}

function renderArray(values: [], model: object, baseKey: string): Promise<(string | number | object | [])[]> {
    return Promise.all(values.map((value, i) => renderValue(value, model, `${baseKey}/${i}`)));
}

function canBeConvertedToFloat(value: string): boolean {
    const number = parseFloat(value);
    return !isNaN(number) && number.toString() === value;
}

export async function buildTargetFromTemplate(name: string, template: object, model: object): Promise<object> {
    return {
        name,
        ...await renderObject(template, model)
    };
}