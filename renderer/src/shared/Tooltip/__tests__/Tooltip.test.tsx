import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from '../Tooltip';

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
});
