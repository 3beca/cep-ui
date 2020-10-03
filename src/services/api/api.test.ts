import { APIResponseData, APIError, isAPIError } from '../../utils/fetch-api';
import {
    setupNock,
    generateListWith,
    serverGet,
    serverGetList,
    serverDelete,
    serverCreate,
    serverGet401,
    serverGetList401,
    serverPost401,
    serverDelete401,
    serverGetAuth,
    serverGetListAuth,
    serverDeleteAuth,
    serverCreateAuth
} from '../../test-utils';

import {
    parseFilters,
    Api,
    buildApiService,
    ServiceList,
    ServiceError,
    ServiceDeleted,
    Entity,
    RuleFilter,
    RuleFilterComparator,
    getRuleFilters,
    isRuleFilter,
    isRuleFilterArray,
    isRuleFilterAND,
    isRuleFilterOR,
    isRuleFilterFieldValue,
    isRuleFilterComparator,
    isRuleFilterValue,
    isRuleFilterComparatorLocation,
    isRuleFilterComparatorEQ,
    isRuleFilterComparatorGT,
    isRuleFilterComparatorGTE,
    isRuleFilterComparatorLT,
    isRuleFilterComparatorLTE
} from './index';
import {
    EventType,
    Target,
    EventLog,
    RuleBase,
    Rule,
    RuleError,
    isRuleTypeRealtime,
    isRuleTypeSliding,
    isRuleTypeTumbling,
    isRuleTypeHopping
} from './models';
import {
    generateEventType,
    generateTarget,
    generateEventLogListWith,
    generateRule,
    generateEntity
} from '../../test-utils/api';

test('paserFilters should return a valid string', () => {
    expect(parseFilters('')).toEqual(null);
    expect(parseFilters('helloworld')).toEqual('search=helloworld');
    expect(!!parseFilters({})).toEqual(false);
    expect(parseFilters({ eventTypeId: '5e4aa7370c20ff3faab7c7d2' })).toEqual(
        'eventTypeId=5e4aa7370c20ff3faab7c7d2'
    );
    expect(
        parseFilters({
            eventTypeId: '5e4aa7370c20ff3faab7c7d2',
            search: 'anyfilter'
        })
    ).toEqual('eventTypeId=5e4aa7370c20ff3faab7c7d2&search=anyfilter');
    expect(parseFilters({ field1: 'hello', field2: 'world' })).toEqual(
        'field1=hello&field2=world'
    );
});

describe('RuleFilter', () => {
    it('should return true if filter contains and OR', () => {
        const filter: RuleFilter = {
            _or: [{ p1: 5 }, { p2: { _eq: 5 } }, { _and: [] }]
        };

        expect(isRuleFilter(filter)).toBe(true);
        const fields = getRuleFilters(filter);
        expect(fields).toHaveLength(1);

        // Filter 1
        const filter1 = fields![0];
        expect(filter1.field).toEqual('_or');
        expect(isRuleFilter(filter1.value)).toBe(false);
        expect(isRuleFilterArray(filter1.value)).toBe(true);
        expect(isRuleFilterAND(filter1)).toBe(false);
        expect(isRuleFilterOR(filter1)).toBe(true);

        // Filter OR found
        const filterOR = filter1.value as RuleFilter[];
        expect(filterOR).toHaveLength(3);
        const filterOR1 = filterOR![0];
        const filterOR2 = filterOR![1];
        const filterOR3 = filterOR![2];

        // filterOR 1
        expect(isRuleFilter(filterOR1)).toBe(true);
        const filterOR1Fields = getRuleFilters(filterOR1);
        expect(filterOR1Fields).toHaveLength(1);

        const filterOR1Field1 = filterOR1Fields![0];
        expect(filterOR1Field1.field).toEqual('p1');
        expect(isRuleFilter(filterOR1Field1.value)).toBe(false);
        expect(isRuleFilterArray(filterOR1Field1.value)).toBe(false);
        expect(isRuleFilterFieldValue(filterOR1Field1.value)).toBe(true);
        expect(isRuleFilterComparator(filterOR1Field1.value)).toBe(false);
        expect(isRuleFilterValue(filterOR1Field1.value)).toBe(true);
        expect(filterOR1Field1.value).toBe(5);

        // filterOR 1
        expect(isRuleFilter(filterOR2)).toBe(true);
        const filterOR2Fields = getRuleFilters(filterOR2);
        expect(filterOR2Fields).toHaveLength(1);

        const filterOR2Field1 = filterOR2Fields![0];
        expect(filterOR2Field1.field).toEqual('p2');
        expect(isRuleFilter(filterOR2Field1.value)).toBe(false);
        expect(isRuleFilterArray(filterOR2Field1.value)).toBe(false);
        expect(isRuleFilterFieldValue(filterOR2Field1.value)).toBe(true);
        expect(isRuleFilterComparator(filterOR2Field1.value)).toBe(true);
        expect(isRuleFilterValue(filterOR2Field1.value)).toBe(false);
        expect(
            isRuleFilterComparatorLocation(
                filterOR2Field1.value as RuleFilterComparator
            )
        ).toBe(false);
        expect(
            isRuleFilterComparatorEQ(
                filterOR2Field1.value as RuleFilterComparator
            )
        ).toBe(true);
        expect(
            isRuleFilterComparatorGT(
                filterOR2Field1.value as RuleFilterComparator
            )
        ).toBe(false);
        expect(
            isRuleFilterComparatorGTE(
                filterOR2Field1.value as RuleFilterComparator
            )
        ).toBe(false);
        expect(
            isRuleFilterComparatorLT(
                filterOR2Field1.value as RuleFilterComparator
            )
        ).toBe(false);
        expect(
            isRuleFilterComparatorLTE(
                filterOR2Field1.value as RuleFilterComparator
            )
        ).toBe(false);
        expect(filterOR2Field1.value).toEqual({ _eq: 5 });

        // filterOR 3
        expect(isRuleFilter(filterOR3)).toBe(true);
        const filterOR3Fields = getRuleFilters(filterOR3);
        expect(filterOR3Fields).toHaveLength(1);

        const filterOR3Field1 = filterOR3Fields![0];
        expect(filterOR3Field1.field).toEqual('_and');
        expect(isRuleFilter(filterOR3Field1.value)).toBe(false);
        expect(isRuleFilterArray(filterOR3Field1.value)).toBe(true);
        expect(isRuleFilterAND(filterOR3Field1)).toBe(true);
        expect(isRuleFilterOR(filterOR3Field1)).toBe(false);

        // Filter AND found
        const filterAND = filterOR3Field1.value as RuleFilter[];
        expect(filterAND).toHaveLength(0);
    });

    it('should return null RuleFilter when do not have filters', () => {
        const filter: RuleFilter = {};

        expect(isRuleFilter(filter)).toBe(false);
        expect(isRuleFilterArray(filter)).toBe(false);
        expect(isRuleFilterFieldValue(filter)).toBe(false);
        expect(getRuleFilters(filter)).toBe(null);
    });

    it('should return null when try to getRuleFilter from no Rulefilter', () => {
        const filter: RuleFilter = (null as unknown) as RuleFilter;

        expect(isRuleFilter(filter)).toBe(false);
        expect(isRuleFilterArray(filter)).toBe(false);
        expect(isRuleFilterFieldValue(filter)).toBe(false);
        expect(getRuleFilters(filter)).toBe(null);
    });

    it('should return a list of filters with values from RuleFilter', () => {
        const filter: RuleFilter = {
            filter1: 25,
            filter2: 50
        };

        expect(isRuleFilter(filter)).toBe(true);
        const filters = getRuleFilters(filter);

        expect(filters![0].field).toEqual('filter1');
        expect(isRuleFilterFieldValue(filters![0].value)).toBe(true);
        expect(isRuleFilterValue(filters![0].value)).toBe(true);

        expect(filters![1].field).toEqual('filter2');
        expect(isRuleFilterFieldValue(filters![1].value)).toBe(true);
        expect(isRuleFilterValue(filters![1].value)).toBe(true);

        expect(filters).toEqual([
            { field: 'filter1', value: 25 },
            { field: 'filter2', value: 50 }
        ]);
    });

    it('should return a list of filters with Comparators from RuleFilter', () => {
        const filter: RuleFilter = {
            feq: { _eq: 10 },
            fgt: { _gt: 10 },
            fgte: { _gte: 10 },
            flt: { _lt: 10 },
            flte: { _lte: 10 },
            fnear: {
                _near: {
                    _geometry: {
                        type: 'Point',
                        coordinates: [1, 1]
                    },
                    _minDistance: 10,
                    _maxDistance: 10
                }
            }
        };

        expect(isRuleFilter(filter)).toBe(true);
        const filters = getRuleFilters(filter);

        expect(filters![0].field).toEqual('feq');
        expect(isRuleFilter(filters![0].value)).toBe(false);
        expect(isRuleFilterArray(filters![0].value)).toBe(false);
        expect(isRuleFilterFieldValue(filters![0].value)).toBe(true);
        expect(isRuleFilterValue(filters![0].value)).toBe(false);
        expect(isRuleFilterComparator(filters![0].value)).toBe(true);
        expect(
            isRuleFilterComparatorEQ(filters![0].value as RuleFilterComparator)
        ).toBe(true);

        expect(filters![1].field).toEqual('fgt');
        expect(isRuleFilter(filters![1].value)).toBe(false);
        expect(isRuleFilterArray(filters![1].value)).toBe(false);
        expect(isRuleFilterFieldValue(filters![1].value)).toBe(true);
        expect(isRuleFilterValue(filters![1].value)).toBe(false);
        expect(isRuleFilterComparator(filters![1].value)).toBe(true);
        expect(
            isRuleFilterComparatorGT(filters![1].value as RuleFilterComparator)
        ).toBe(true);

        expect(filters![2].field).toEqual('fgte');
        expect(isRuleFilter(filters![2].value)).toBe(false);
        expect(isRuleFilterArray(filters![2].value)).toBe(false);
        expect(isRuleFilterFieldValue(filters![2].value)).toBe(true);
        expect(isRuleFilterValue(filters![2].value)).toBe(false);
        expect(isRuleFilterComparator(filters![2].value)).toBe(true);
        expect(
            isRuleFilterComparatorGTE(filters![2].value as RuleFilterComparator)
        ).toBe(true);

        expect(filters![3].field).toEqual('flt');
        expect(isRuleFilter(filters![3].value)).toBe(false);
        expect(isRuleFilterArray(filters![3].value)).toBe(false);
        expect(isRuleFilterFieldValue(filters![3].value)).toBe(true);
        expect(isRuleFilterValue(filters![3].value)).toBe(false);
        expect(isRuleFilterComparator(filters![3].value)).toBe(true);
        expect(
            isRuleFilterComparatorLT(filters![3].value as RuleFilterComparator)
        ).toBe(true);

        expect(filters![4].field).toEqual('flte');
        expect(isRuleFilter(filters![4].value)).toBe(false);
        expect(isRuleFilterArray(filters![4].value)).toBe(false);
        expect(isRuleFilterFieldValue(filters![4].value)).toBe(true);
        expect(isRuleFilterValue(filters![4].value)).toBe(false);
        expect(isRuleFilterComparator(filters![4].value)).toBe(true);
        expect(
            isRuleFilterComparatorLTE(filters![4].value as RuleFilterComparator)
        ).toBe(true);

        expect(filters![5].field).toEqual('fnear');
        expect(isRuleFilter(filters![5].value)).toBe(false);
        expect(isRuleFilterArray(filters![5].value)).toBe(false);
        expect(isRuleFilterFieldValue(filters![5].value)).toBe(true);
        expect(isRuleFilterValue(filters![5].value)).toBe(false);
        expect(isRuleFilterComparator(filters![5].value)).toBe(true);
        expect(
            isRuleFilterComparatorLocation(
                filters![5].value as RuleFilterComparator
            )
        ).toBe(true);
    });
});

describe('Rule', () => {
    const createBaseRule = (): RuleBase => ({
        id: 'id',
        name: 'name',
        eventTypeId: 'evId',
        eventTypeName: 'evName',
        targetId: 'tgId',
        targetName: 'tgName',
        filters: {},
        skipOnConsecutivesMatches: false,
        createdAt: '',
        updatedAt: ''
    });

    it('isRuleTypeRealtime should check if realtime', () => {
        const ruleRT = { ...createBaseRule(), type: 'realtime' } as Rule;
        expect(isRuleTypeRealtime(ruleRT)).toBe(true);

        const ruleSliding = { ...createBaseRule(), type: 'sliding' } as Rule;
        expect(isRuleTypeRealtime(ruleSliding)).toBe(false);
    });

    it('isRuleTypeSliding should check if sliding', () => {
        const ruleSliding: Rule = {
            ...createBaseRule(),
            type: 'sliding',
            group: {
                avgTemperature: { _avg: 'temperature' },
                maxTemperature: { _max: 'temperature' },
                minTemperature: { _min: 'temperature' },
                sumTemperature: { _sum: 'temperature' },
                devStdPopTemperature: { _stdDevPop: 'temperature' },
                devStdsamTemperature: { _stdDevSamp: 'temperature' }
            },
            windowSize: { unit: 'second', value: 1 }
        };
        expect(isRuleTypeSliding(ruleSliding)).toBe(true);

        const ruleRT: Rule = {
            ...createBaseRule(),
            type: 'realtime'
        };
        expect(isRuleTypeSliding(ruleRT)).toBe(false);
    });

    it('isRuleTypeTumbling should check if tumbling', () => {
        const ruleTumbling: Rule = {
            ...createBaseRule(),
            type: 'tumbling',
            group: {
                avgTemperature: { _avg: 'temperature' },
                maxTemperature: { _max: 'temperature' },
                minTemperature: { _min: 'temperature' },
                sumTemperature: { _sum: 'temperature' },
                devStdPopTemperature: { _stdDevPop: 'temperature' },
                devStdsamTemperature: { _stdDevSamp: 'temperature' }
            },
            windowSize: { unit: 'second', value: 1 }
        };
        expect(isRuleTypeTumbling(ruleTumbling)).toBe(true);

        const ruleRT: Rule = {
            ...createBaseRule(),
            type: 'realtime'
        };
        expect(isRuleTypeTumbling(ruleRT)).toBe(false);
    });

    it('isRuleTypeHopping should check if hopping', () => {
        const ruleHopping: Rule = {
            ...createBaseRule(),
            type: 'hopping',
            group: {
                avgTemperature: { _avg: 'temperature' },
                maxTemperature: { _max: 'temperature' },
                minTemperature: { _min: 'temperature' },
                sumTemperature: { _sum: 'temperature' },
                devStdPopTemperature: { _stdDevPop: 'temperature' },
                devStdsamTemperature: { _stdDevSamp: 'temperature' }
            },
            windowSize: { unit: 'second', value: 1 }
        };
        expect(isRuleTypeHopping(ruleHopping)).toBe(true);

        const ruleRT: Rule = {
            ...createBaseRule(),
            type: 'realtime'
        };
        expect(isRuleTypeHopping(ruleRT)).toBe(false);
    });
});

describe('CEP API', () => {
    let api: Api;
    const BASE_URL = 'https://localhost:123';
    const PATH = '/anypath';
    const server = setupNock(BASE_URL);

    beforeAll(() => (api = buildApiService(BASE_URL)));

    it('getRequest should return an Element', async () => {
        const expectedResult = generateEntity('myElement');
        serverGet(server, PATH, 200, expectedResult);

        const result = await api.getRequest<Entity>(PATH);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<Entity>;
        expect(response.status).toBe(200);
        expect(response.data).toEqual(expectedResult);
    });

    it('getRequest should return an APIError when it fails', async () => {
        const expectedResult = {
            statusCode: 400,
            error: 'Bad Request',
            message: 'invalid request'
        };
        serverGet(server, PATH, 400, expectedResult);

        const result = await api.getRequest(PATH);

        expect(isAPIError(result)).toBe(true);
        const error = result as APIError<ServiceError>;
        expect(error).toEqual({
            errorCode: 400,
            errorMessage: 'Error from https://localhost:123/anypath',
            error: {
                statusCode: 400,
                error: 'Bad Request',
                message: 'invalid request'
            }
        });
    });

    it('getListRequest should return a list of Elements', async () => {
        const page = 1;
        const size = 10;
        const expectedResult = generateListWith();
        serverGetList(server, PATH, page, size, undefined, 200, expectedResult);

        const result = await api.getListRequest<Entity>(PATH, page, size);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceList<Entity>>;
        expect(response.status).toBe(200);
        expect(response.data).toEqual(expectedResult);
    });

    it('getListRequest should return a list of one Event Element', async () => {
        const page = 1;
        const size = 1;
        const expectedResult = generateEventLogListWith(1, false, false);
        serverGetList(
            server,
            PATH,
            page,
            size,
            '5e4aa7370c20ff3faab7c7d2',
            200,
            expectedResult
        );
        const result = await api.getListRequest<EventLog>(PATH, page, size, {
            search: '5e4aa7370c20ff3faab7c7d2'
        });

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceList<EventLog>>;
        expect(response.status).toBe(200);
        expect(response.data).toEqual(expectedResult);
    });

    it('getListRequest should return a list of Elements without pagination info', async () => {
        const page = 1;
        const size = 10;
        const expectedResult = generateListWith();
        serverGetList(server, PATH, page, size, '', 200, expectedResult);

        const result = await api.getListRequest(PATH);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceList<Entity>>;
        expect(response.status).toBe(200);
        expect(response.data).toEqual(expectedResult);
    });

    it('getListRequest should return a list of Elements filter by a text', async () => {
        const page = 1;
        const size = 10;
        const filter = 'anyfilter';
        const expectedResult = generateListWith();
        serverGetList(server, PATH, page, size, filter, 200, expectedResult);

        const result = await api.getListRequest(PATH, page, size, filter);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceList<Entity>>;
        expect(response.status).toBe(200);
        expect(response.data).toEqual(expectedResult);
    });

    it('getListRequest should return an APIError when it fails', async () => {
        const page = 1;
        const size = ('ten' as unknown) as number;
        const expectedResult = {
            statusCode: 400,
            error: 'Bad Request',
            message: 'querystring.pageSize should be integer'
        };
        serverGetList(server, PATH, page, size, '', 400, expectedResult);

        const result = await api.getListRequest(PATH, page, size);

        expect(isAPIError(result)).toBe(true);
        const error = result as APIError<ServiceError>;
        expect(error).toEqual({
            errorCode: 400,
            errorMessage:
                'Error from https://localhost:123/anypath/?page=1&pageSize=ten',
            error: {
                statusCode: 400,
                error: 'Bad Request',
                message: 'querystring.pageSize should be integer'
            }
        });
    });

    it('deleteRequest should return one APIError when id is not valid', async () => {
        const id = 'invalidid';
        const response = {
            statusCode: 500,
            error: 'Internal Server Error',
            message:
                'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
        };
        serverDelete(server, PATH, id, 500, response);

        const results = await api.deleteRequest(PATH, id);

        expect(isAPIError(results)).toBe(false);
        const deleted = results as APIResponseData<ServiceDeleted[]>;
        expect(deleted.status).toBe(200);
        expect(deleted.data.length).toBe(1);
        expect(deleted.data[0]).toEqual({
            id,
            state: 'REJECTED',
            error: {
                statusCode: 500,
                error: 'Internal Server Error',
                message:
                    'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
            }
        });
    });

    it('deleteRequest should return an APIError when id is undefined', async () => {
        const id = (undefined as unknown) as string;

        const result = await api.deleteRequest(PATH, id);

        expect(isAPIError(result)).toBe(true);
        const error = result as APIError<ServiceError>;
        expect(error).toEqual({
            errorCode: 500,
            errorMessage: 'id is an invalid id value or array',
            error: {
                statusCode: 500,
                error: 'Missing id',
                message: 'id is an invalid id value or array'
            }
        });
    });

    it('deleteRequest should return two APIError when ids are not valid', async () => {
        const ids = ['invalidid1', 'invalid2'];
        const response = {
            statusCode: 500,
            error: 'Internal Server Error',
            message:
                'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
        };
        serverDelete(server, PATH, ids[0], 500, response);
        serverDelete(server, PATH, ids[1], 500, response);

        const result = await api.deleteRequest(PATH, ids);

        expect(isAPIError(result)).toBe(false);
        const deleted = result as APIResponseData<ServiceDeleted[]>;
        expect(deleted.status).toBe(200);
        expect(deleted.data.length).toBe(2);

        const error = deleted.data[0];
        expect(error).toEqual({
            id: ids[0],
            state: 'REJECTED',
            error: {
                statusCode: 500,
                error: 'Internal Server Error',
                message:
                    'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
            }
        });

        const error2 = deleted.data[1];
        expect(error2).toEqual({
            id: ids[1],
            state: 'REJECTED',
            error: {
                statusCode: 500,
                error: 'Internal Server Error',
                message:
                    'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
            }
        });
    });

    it('deleteRequest should return one 204 empty response when eventTypeId is valid ', async () => {
        const eventTypeId = '5e8dffc9c906fefd9e7b2486';
        serverDelete(server, PATH, eventTypeId, 204);

        const result = await api.deleteRequest(PATH, eventTypeId);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceDeleted[]>;
        expect(response.status).toBe(200);
        expect(response.data.length).toBe(1);
        expect(response.data[0]).toEqual({
            id: eventTypeId,
            state: 'DELETED'
        });
    });

    it('deleteRequest should return two 204 empty response when eventTypeIds are valid ', async () => {
        const eventTypeIds = [
            '5e8dffc9c906fefd9e7b2486',
            '5e8dffd0c906fe54737b2487'
        ];
        serverDelete(server, PATH, eventTypeIds[0], 204);
        serverDelete(server, PATH, eventTypeIds[1], 204);

        const result = await api.deleteRequest(PATH, eventTypeIds);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceDeleted[]>;
        expect(response.status).toBe(200);
        expect(response.data.length).toBe(2);

        const deleted1 = response.data[0];
        expect(deleted1).toEqual({
            id: eventTypeIds[0],
            state: 'DELETED'
        });

        const deleted2 = response.data[1];
        expect(deleted2).toEqual({
            id: eventTypeIds[1],
            state: 'DELETED'
        });
    });

    it('deleteRequest should return one 204 empty response and one APIError when eventTypeIds are valid e invalid ', async () => {
        const eventTypeIds = ['5e8dffc9c906fefd9e7b2486', 'invalidid'];
        const responseError = {
            statusCode: 500,
            error: 'Internal Server Error',
            message:
                'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
        };
        serverDelete(server, PATH, eventTypeIds[0], 204);
        serverDelete(server, PATH, eventTypeIds[1], 500, responseError);

        const result = await api.deleteRequest(PATH, eventTypeIds);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceDeleted[]>;
        expect(response.status).toBe(200);
        expect(response.data.length).toBe(2);

        const deleted1 = response.data[0];
        expect(deleted1).toEqual({
            id: eventTypeIds[0],
            state: 'DELETED'
        });

        const errorDeleted = response.data[1];
        expect(errorDeleted).toEqual({
            id: eventTypeIds[1],
            state: 'REJECTED',
            error: {
                statusCode: 500,
                error: 'Internal Server Error',
                message:
                    'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
            }
        });
    });

    it('createRequest should return error when eventtype name exists in server', async () => {
        const eventTypeBody: Partial<EventType> = { name: 'new entity' };
        serverCreate(server, PATH, JSON.stringify(eventTypeBody), 409, {
            message:
                'Event type name must be unique and is already taken by event type with id 5ec39c6f118b4dbbe07b1cbb'
        });

        const result = await api.createRequest(PATH, eventTypeBody);

        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<ServiceError>;
        expect(response.errorCode).toBe(409);
        expect(response.errorMessage).toEqual(
            'Error from https://localhost:123/anypath'
        );
        expect(response.error).toEqual({
            message:
                'Event type name must be unique and is already taken by event type with id 5ec39c6f118b4dbbe07b1cbb'
        });
    });

    it('createRequest should return error when eventtype name is invalid', async () => {
        const eventTypeBody = (undefined as unknown) as Partial<EventType>;
        const errorRespponse: ServiceError = {
            statusCode: 400,
            error: 'Bad Request',
            message:
                "FST_ERR_CTP_EMPTY_JSON_BODY: Body cannot be empty when content-type is set to 'application/json'"
        };
        serverCreate(server, PATH, '', 400, errorRespponse);

        const result = await api.createRequest(PATH, eventTypeBody);

        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<ServiceError>;
        expect(response.errorCode).toBe(400);
        expect(response.errorMessage).toEqual(
            'Error from https://localhost:123/anypath'
        );
        expect(response.error).toEqual({
            error: 'Bad Request',
            statusCode: 400,
            message:
                "FST_ERR_CTP_EMPTY_JSON_BODY: Body cannot be empty when content-type is set to 'application/json'"
        });
    });

    it('createRequest should return error when no name presents', async () => {
        const eventTypeBody = ({} as unknown) as Partial<EventType>;
        const errorRespponse: ServiceError = {
            statusCode: 400,
            error: 'Bad Request',
            message: "body should have required property 'name'"
        };
        serverCreate(server, PATH, '{}', 400, errorRespponse);

        const result = await api.createRequest(PATH, eventTypeBody);

        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<ServiceError>;
        expect(response.errorCode).toBe(400);
        expect(response.errorMessage).toEqual(
            'Error from https://localhost:123/anypath'
        );
        expect(response.error).toEqual({
            error: 'Bad Request',
            statusCode: 400,
            message: "body should have required property 'name'"
        });
    });

    it('createRequest should return 200 and a Entity when create corrected', async () => {
        const eventTypeResponse = generateEventType(1, 'test', 'test');
        const eventTypeBody: Partial<EventType> = {
            name: eventTypeResponse.name
        };
        serverCreate(
            server,
            PATH,
            JSON.stringify(eventTypeBody),
            201,
            eventTypeResponse
        );
        const result = await api.createRequest(PATH, eventTypeBody);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<EventType>;
        expect(response.status).toBe(201);
        expect(response.data).toEqual(eventTypeResponse);
    });

    it('createRequest should return error when Target name exists in server', async () => {
        const targetBody = {
            name: 'new target entity',
            url: 'https://whateveryouwant.com'
        };
        const errorResponse = {
            message:
                'Target name must be unique and is already taken by target with id 5ec39c6f118b4dbbe07b1cbb'
        };
        serverCreate(
            server,
            PATH,
            JSON.stringify(targetBody),
            409,
            errorResponse
        );
        const result = await api.createRequest(PATH, targetBody);

        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<ServiceError>;
        expect(response.errorCode).toBe(409);
        expect(response.errorMessage).toEqual(
            'Error from https://localhost:123/anypath'
        );
        expect(response.error).toEqual({
            message:
                'Target name must be unique and is already taken by target with id 5ec39c6f118b4dbbe07b1cbb'
        });
    });

    it('createRequest should return 200 and a Entity Target when create corrected', async () => {
        const target = generateTarget(1, 'test', 'test');
        const targetBody = { name: target.name, url: target.url };
        serverCreate(server, PATH, JSON.stringify(targetBody), 201, target);

        const result = await api.createRequest(PATH, targetBody);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<Target>;
        expect(response.status).toBe(201);
        expect(response.data).toEqual(target);
    });

    it('createRequest should return 200 and a Entity Rule when create corrected', async () => {
        const rule: Rule = generateRule('ruletest', 1);
        const error = {
            statusCode: 400,
            error: 'Bad Request',
            message:
                'body/targetId should be a valid ObjectId, body/eventTypeId should be a valid ObjectId'
        };
        const ruleBody = {
            name: rule.name,
            targetId: rule.targetId,
            eventTypeId: rule.eventTypeId,
            type: 'realTime'
        };
        serverCreate(server, PATH, JSON.stringify(ruleBody), 400, error);
        const result = await api.createRequest(PATH, ruleBody);
        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<RuleError>;
        expect(response.errorCode).toBe(400);
        expect(response.errorMessage).toEqual(
            'Error from https://localhost:123/anypath'
        );
        expect(response.error).toEqual(error);
    });
});

describe('CEP API with NO Authorization when it is required', () => {
    let api: Api;
    const BASE_URL = 'https://localhost:123';
    const PATH = '/anypath';
    const server = setupNock(BASE_URL);

    beforeAll(() => (api = buildApiService(BASE_URL)));

    it('getListRequest should return 401 when no authorization', async () => {
        const page = 1;
        const size = 10;
        serverGetList401(server, PATH, page, size);

        const result = await api.getListRequest<Entity>(PATH, page, size);

        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<ServiceError>;
        expect(response.errorCode).toBe(401);
        expect(response.errorMessage).toEqual(
            expect.stringContaining(`${BASE_URL}${PATH}`)
        );
        expect(response.error).toEqual({
            error: 'missing authorization header'
        });
    });

    it('deleteRequest should return 401 when no authorization', async () => {
        const id = '1234567890';
        serverDelete401(server, PATH, id);

        const result = await api.deleteRequest(PATH, id);

        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<ServiceError>;
        expect(response.errorCode).toBe(401);
        expect(response.errorMessage).toEqual('missing authorization header');
        expect(response.error).toEqual({
            statusCode: 401,
            error: 'missing authorization header',
            message: 'missing authorization header'
        });
    });

    it('createRequest should return 401 when no authorization', async () => {
        const targetBody = {
            name: 'new target entity',
            url: 'https://whateveryouwant.com'
        };
        serverPost401(server, PATH, JSON.stringify(targetBody));
        const result = await api.createRequest(PATH, targetBody);

        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<ServiceError>;
        expect(response.errorCode).toBe(401);
        expect(response.errorMessage).toEqual(
            expect.stringContaining(`${BASE_URL}${PATH}`)
        );
        expect(response.error).toEqual({
            error: 'missing authorization header'
        });
    });

    it('getRequest should return 401 when no authorization', async () => {
        serverGet401(server, PATH);

        const result = await api.getRequest<Entity>(PATH);

        expect(isAPIError(result)).toBe(true);
        const response = result as APIError<ServiceError>;
        expect(response.errorCode).toBe(401);
        expect(response.errorMessage).toEqual(
            expect.stringContaining(`${BASE_URL}${PATH}`)
        );
        expect(response.error).toEqual({
            error: 'missing authorization header'
        });
    });
});

describe('CEP API with Authorization when it is required', () => {
    let api: Api;
    const BASE_URL = 'https://localhost:123';
    const PATH = '/anypath';
    const server = setupNock(BASE_URL);
    const apiKey = '1234567890';

    beforeAll(
        () =>
            (api = buildApiService(BASE_URL, {
                method: 'GET',
                headers: { authorization: 'apiKey ' + apiKey }
            }))
    );

    it('getRequest should return an Element', async () => {
        const expectedResult = generateEntity('myElement');
        serverGetAuth(server, PATH, apiKey, 200, expectedResult);

        const result = await api.getRequest<Entity>(PATH);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<Entity>;
        expect(response.status).toBe(200);
        expect(response.data).toEqual(expectedResult);
    });

    it('getListRequest should return a list of Elements', async () => {
        const page = 1;
        const size = 10;
        const expectedResult = generateListWith();
        serverGetListAuth(
            server,
            PATH,
            apiKey,
            page,
            size,
            undefined,
            200,
            expectedResult
        );

        const result = await api.getListRequest<Entity>(PATH, page, size);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceList<Entity>>;
        expect(response.status).toBe(200);
        expect(response.data).toEqual(expectedResult);
    });

    it('deleteRequest should return one 204 empty response when eventTypeId is valid ', async () => {
        const eventTypeId = '5e8dffc9c906fefd9e7b2486';
        serverDeleteAuth(server, PATH, apiKey, eventTypeId, 204);

        const result = await api.deleteRequest(PATH, eventTypeId);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<ServiceDeleted[]>;
        expect(response.status).toBe(200);
        expect(response.data.length).toBe(1);
        expect(response.data[0]).toEqual({
            id: eventTypeId,
            state: 'DELETED'
        });
    });

    it('createRequest should return 200 and a Entity Target when create corrected', async () => {
        const target = generateTarget(1, 'test', 'test');
        const targetBody = { name: target.name, url: target.url };
        serverCreateAuth(
            server,
            PATH,
            apiKey,
            JSON.stringify(targetBody),
            201,
            target
        );

        const result = await api.createRequest(PATH, targetBody);

        expect(isAPIError(result)).toBe(false);
        const response = result as APIResponseData<Target>;
        expect(response.status).toBe(201);
        expect(response.data).toEqual(target);
    });
});
