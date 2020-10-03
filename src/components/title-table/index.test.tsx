import * as React from 'react';
import { render } from '@testing-library/react';
import TitleTable from './index';

test('TitleTable render with the title provided and snapshot', () => {
    const title = 'Table title component';
    const { container, getByLabelText } = render(<TitleTable title={title} />);

    expect(getByLabelText(/table title/i)).toHaveTextContent(title);
    expect(container).toMatchSnapshot();
});
