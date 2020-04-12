import nock from 'nock';

export const setupNock = (url: string) => {
    const server = nock(url).defaultReplyHeaders({ 'access-control-allow-origin': '*' });
    // Skip Preflight CORS OPTION request
    nock(url).intercept(/./, 'OPTIONS').reply(200, undefined, { 'access-control-allow-origin': '*' }).persist();
    return server;
}