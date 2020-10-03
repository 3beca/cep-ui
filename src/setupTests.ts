// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

Object.defineProperty(window, '_env_', {
    value: { BASE_URL: 'http://localhost:123', writable: false }
});
const mockClipboard = {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('')
};
Object.defineProperty(window.navigator, 'clipboard', { value: mockClipboard });
