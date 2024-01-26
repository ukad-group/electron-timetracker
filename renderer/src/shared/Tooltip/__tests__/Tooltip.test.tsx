import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from '../Tooltip';
import { CONNECTION_MESSAGE } from '@/helpers/contstants';

describe('Tooltip Component', () => {
  test('should render without errors', () => {
    render(<Tooltip isClickable>Test</Tooltip>);
  });

  test('handles click event', async () => {
    render(<Tooltip isClickable>Test</Tooltip>);
    const tooltipWrapper = screen.getByTestId('clickable-tooltip-test-id');
    fireEvent.click(tooltipWrapper);

    expect("Copied").toBeDefined();
  });

  test('handles mouse enter and leave events', async () => {
    render(<Tooltip>Test</Tooltip>);
    const tooltipWrapper = screen.getByTestId('hover-tooltip-test-id');
    fireEvent.mouseEnter(tooltipWrapper);

    expect(CONNECTION_MESSAGE).toBeDefined();

    fireEvent.mouseLeave(tooltipWrapper);
  });
});
