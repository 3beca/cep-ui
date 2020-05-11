import { APIResponseData, APIError, isAPIError } from '../../utils/fetch-api';
import {
    setupNock,
    generateListWith,
    serverGetList,
    serverDelete
} from '../../test-utils';

import {
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

describe(
    'CEP API',
    () => {
        let api: Api;
        const BASE_URL = 'https://localhost:123';
        const PATH = '/anypath';
        const server = setupNock(BASE_URL);

        beforeAll(() => api = buildApiService(BASE_URL));

        it(
            'getListRequest should return a list of Elements',
            async () => {
                const page = 1;
                const size = 10;
                const expectedResult = generateListWith();
                serverGetList(server, PATH, page, size, undefined, 200, expectedResult);

                const result = await api.getListRequest<Entity>(PATH, page, size);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<ServiceList<Entity>>;
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResult);
                expect(1).toBe(1);
            }
        );

        it(
            'getListRequest should return a list of Elements without pagination info',
            async () => {
                const page = 1;
                const size = 10;
                const expectedResult = generateListWith();
                serverGetList(server, PATH, page, size, '', 200, expectedResult);

                const result = await api.getListRequest(PATH);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<ServiceList<Entity>>;
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResult);
            }
        );

        it(
            'getListRequest should return a list of Elements filter by a text',
            async () => {
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
            }
        );

        it(
            'getListRequest should return an APIError when it fails',
            async () => {
                const page = 1;
                const size = 'ten' as unknown as number;
                const expectedResult = {statusCode: 400, error: 'Bad Request', message: 'querystring.pageSize should be integer'};
                serverGetList(server, PATH, page, size, '', 400, expectedResult);

                const result = await api.getListRequest(PATH, page, size);

                expect(isAPIError(result)).toBe(true);
                const error = result as APIError<ServiceError>;
                expect(error).toEqual({
                    errorCode: 400,
                    errorMessage: 'Error from https://localhost:123/anypath/?page=1&pageSize=ten',
                    error: {
                        statusCode: 400,
                        error: 'Bad Request',
                        message: 'querystring.pageSize should be integer'
                    }
                });
            }
        );

        it(
            'deleteRequest should return one APIError when id is not valid',
            async () => {
                const id = 'invalidid';
                const response = {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'};
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
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });
            }
        );

        it(
            'deleteRequest should return an APIError when id is undefined',
            async () => {
                const id = undefined as unknown as string;

                const result = await api.deleteRequest(PATH, id);

                expect(isAPIError(result)).toBe(true);
                const error = result as APIError<ServiceError>;
                expect(error).toEqual({
                    errorCode: 500,
                    errorMessage: '',
                    error: {
                        statusCode: 500,
                        error: 'Missing id',
                        message: 'id is an invalid id value or array'
                    }
                });
            }
        );

        it(
            'deleteEvent should return two APIError when ids are not valid',
            async () => {
                const ids = ['invalidid1', 'invalid2'];
                const response = {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'};
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
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });

                const error2 = deleted.data[1];
                expect(error2).toEqual({
                    id: ids[1],
                    state: 'REJECTED',
                    error: {
                        statusCode: 500,
                        error: 'Internal Server Error',
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });
            }
        );

        it(
            'deleteEvent should return one 204 empty response when eventTypeId is valid ',
            async () => {
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
            }
        );

        it(
            'deleteEvent should return two 204 empty response when eventTypeIds are valid ',
            async () => {
                const eventTypeIds = ['5e8dffc9c906fefd9e7b2486', '5e8dffd0c906fe54737b2487'];
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
            }
        );

        it(
            'deleteEvent should return one 204 empty response and one APIError when eventTypeIds are valid e invalid ',
            async () => {
                const eventTypeIds = ['5e8dffc9c906fefd9e7b2486', 'invalidid'];
                const responseError = {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'};
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
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });
            }
        );
    }
);

describe(
    'RuleFilter',
    () => {
        it(
            'should return true if filter contains and OR',
            () => {
                const filter: RuleFilter = {
                    '_or': [
                        {p1: 5},
                        {p2: {'_eq': 5}},
                        {'_and': []}
                    ]
                };

                // Pattern
                // 0. Get Rule Filters
                // ForEach RuleFilter
                // 1. Is filter
                // 2. Get Fields
                // 3. Get Arrays
                // 4. Get
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
                expect(isRuleFilterComparatorLocation(filterOR2Field1.value as RuleFilterComparator)).toBe(false);
                expect(isRuleFilterComparatorEQ(filterOR2Field1.value as RuleFilterComparator)).toBe(true);
                expect(isRuleFilterComparatorGT(filterOR2Field1.value as RuleFilterComparator)).toBe(false);
                expect(isRuleFilterComparatorGTE(filterOR2Field1.value as RuleFilterComparator)).toBe(false);
                expect(isRuleFilterComparatorLT(filterOR2Field1.value as RuleFilterComparator)).toBe(false);
                expect(isRuleFilterComparatorLTE(filterOR2Field1.value as RuleFilterComparator)).toBe(false);
                expect(filterOR2Field1.value).toEqual({'_eq': 5});

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
            }
        );

        it(
            'should return null RuleFilter when do not have filters',
            () => {
                const filter: RuleFilter = {};

                expect(isRuleFilter(filter)).toBe(false);
                expect(isRuleFilterArray(filter)).toBe(false);
                expect(isRuleFilterFieldValue(filter)).toBe(false);
                expect(getRuleFilters(filter)).toBe(null);
            }
        );

        it(
            'should return null when try to getRuleFilter from no Rulefilter',
            () => {
                const filter: RuleFilter = null as unknown as RuleFilter;

                expect(isRuleFilter(filter)).toBe(false);
                expect(isRuleFilterArray(filter)).toBe(false);
                expect(isRuleFilterFieldValue(filter)).toBe(false);
                expect(getRuleFilters(filter)).toBe(null);
            }
        );

        it(
            'should return a list of filters with values from RuleFilter',
            () => {
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
                    {field: 'filter1', value: 25},
                    {field: 'filter2', value: 50}
                ]);
            }
        );

        it(
            'should return a list of filters with Comparators from RuleFilter',
            () => {
                const filter: RuleFilter = {
                    feq: {'_eq': 10},
                    fgt: {'_gt': 10},
                    fgte: {'_gte': 10},
                    flt: {'_lt': 10},
                    flte: {'_lte': 10},
                    fnear: {'_near': {
                        '_geometry': {
                            type: 'Point',
                            coordinates: [1, 1]
                        },
                        '_minDistance': 10,
                        '_maxDistance': 10
                    }},
                };

                expect(isRuleFilter(filter)).toBe(true);
                const filters = getRuleFilters(filter);

                expect(filters![0].field).toEqual('feq');
                expect(isRuleFilter(filters![0].value)).toBe(false);
                expect(isRuleFilterArray(filters![0].value)).toBe(false);
                expect(isRuleFilterFieldValue(filters![0].value)).toBe(true);
                expect(isRuleFilterValue(filters![0].value)).toBe(false);
                expect(isRuleFilterComparator(filters![0].value)).toBe(true);
                expect(isRuleFilterComparatorEQ(filters![0].value as RuleFilterComparator)).toBe(true);

                expect(filters![1].field).toEqual('fgt');
                expect(isRuleFilter(filters![1].value)).toBe(false);
                expect(isRuleFilterArray(filters![1].value)).toBe(false);
                expect(isRuleFilterFieldValue(filters![1].value)).toBe(true);
                expect(isRuleFilterValue(filters![1].value)).toBe(false);
                expect(isRuleFilterComparator(filters![1].value)).toBe(true);
                expect(isRuleFilterComparatorGT(filters![1].value as RuleFilterComparator)).toBe(true);

                expect(filters![2].field).toEqual('fgte');
                expect(isRuleFilter(filters![2].value)).toBe(false);
                expect(isRuleFilterArray(filters![2].value)).toBe(false);
                expect(isRuleFilterFieldValue(filters![2].value)).toBe(true);
                expect(isRuleFilterValue(filters![2].value)).toBe(false);
                expect(isRuleFilterComparator(filters![2].value)).toBe(true);
                expect(isRuleFilterComparatorGTE(filters![2].value as RuleFilterComparator)).toBe(true);

                expect(filters![3].field).toEqual('flt');
                expect(isRuleFilter(filters![3].value)).toBe(false);
                expect(isRuleFilterArray(filters![3].value)).toBe(false);
                expect(isRuleFilterFieldValue(filters![3].value)).toBe(true);
                expect(isRuleFilterValue(filters![3].value)).toBe(false);
                expect(isRuleFilterComparator(filters![3].value)).toBe(true);
                expect(isRuleFilterComparatorLT(filters![3].value as RuleFilterComparator)).toBe(true);

                expect(filters![4].field).toEqual('flte');
                expect(isRuleFilter(filters![4].value)).toBe(false);
                expect(isRuleFilterArray(filters![4].value)).toBe(false);
                expect(isRuleFilterFieldValue(filters![4].value)).toBe(true);
                expect(isRuleFilterValue(filters![4].value)).toBe(false);
                expect(isRuleFilterComparator(filters![4].value)).toBe(true);
                expect(isRuleFilterComparatorLTE(filters![4].value as RuleFilterComparator)).toBe(true);

                expect(filters![5].field).toEqual('fnear');
                expect(isRuleFilter(filters![5].value)).toBe(false);
                expect(isRuleFilterArray(filters![5].value)).toBe(false);
                expect(isRuleFilterFieldValue(filters![5].value)).toBe(true);
                expect(isRuleFilterValue(filters![5].value)).toBe(false);
                expect(isRuleFilterComparator(filters![5].value)).toBe(true);
                expect(isRuleFilterComparatorLocation(filters![5].value as RuleFilterComparator)).toBe(true);
            }
        );
    }
);
