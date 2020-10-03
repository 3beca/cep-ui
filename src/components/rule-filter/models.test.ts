import {
    isContainer,
    isContainerAND,
    isContainerOR,
    isContainerDefault,
    isExpression,
    isExpressionPassthrow,
    isExpressionDefault,
    isExpressionComparator,
    isExpressionLocation,
    Container,
    EPassthrow,
    EDefault,
    EComparator,
    EComparatorLocation,
    ContainerAND,
    ContainerOR,
    ContainerDefault
} from './models';

test('check types should return the correct type', () => {
    const container: Container = { model: 'CONTAINER' } as Container;
    const containerAND: ContainerAND = {
        model: 'CONTAINER',
        type: 'AND'
    } as ContainerAND;
    const containerOR: ContainerOR = {
        model: 'CONTAINER',
        type: 'OR'
    } as ContainerOR;
    const containerDefault: ContainerDefault = {
        model: 'CONTAINER',
        type: 'DEFAULT'
    } as ContainerDefault;

    const passExpression = {
        model: 'EXPRESSION',
        type: 'PASSTHROW'
    } as EPassthrow;
    const defaultExpression = {
        model: 'EXPRESSION',
        type: 'DEFAULT'
    } as EDefault;
    const comparatorExpression = {
        model: 'EXPRESSION',
        type: 'COMPARATOR'
    } as EComparator;
    const geoExpression = {
        model: 'EXPRESSION',
        type: 'GEO'
    } as EComparatorLocation;

    expect(isContainer(container)).toBe(true);
    expect(isContainer(passExpression)).toBe(false);
    expect(isContainerAND(containerAND)).toBe(true);
    expect(isContainerAND(container)).toBe(false);
    expect(isContainerOR(containerOR)).toBe(true);
    expect(isContainerOR(container)).toBe(false);
    expect(isContainerDefault(containerDefault)).toBe(true);
    expect(isContainerDefault(container)).toBe(false);
    expect(isExpression(container)).toBe(false);
    expect(isExpression(passExpression)).toBe(true);
    expect(isExpressionPassthrow(passExpression)).toBe(true);
    expect(isExpressionPassthrow(geoExpression)).toBe(false);
    expect(isExpressionDefault(defaultExpression)).toBe(true);
    expect(isExpressionDefault(geoExpression)).toBe(false);
    expect(isExpressionComparator(comparatorExpression)).toBe(true);
    expect(isExpressionComparator(geoExpression)).toBe(false);
    expect(isExpressionLocation(geoExpression)).toBe(true);
    expect(isExpressionLocation(passExpression)).toBe(false);
});
