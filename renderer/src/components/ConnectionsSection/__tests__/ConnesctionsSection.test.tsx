import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import renderer from 'react-test-renderer';
import ConnectionsSection from '../ConnectionsSection';

jest.mock('next/router', () => ({
  useRouter: () => ({
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '',
    push: async () => true,
    replace: async () => true,
    reload: () => {},
    back: () => {},
    prefetch: async () => undefined,
    beforePopState: () => {},
    events: {
      on: () => {},
      off: () => {},
      emit: () => {},
    },
  }),
}));

// @ts-ignore
global.ipcRenderer = {
  on: jest.fn(),
  removeAllListeners: jest.fn()
};

jest.mock('@/helpers/hooks', () => ({
  useOnlineStatus: jest.fn(() => ({ isOnline: true })),
}));

describe("GIVEN ConnectionsSection", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders ConnectionsSection correctly', () => {
    console.log("ipcRenderer mock:", global.ipcRenderer);
    const { getByText } = render(<ConnectionsSection />);

    expect(getByText('Connections')).toBeInTheDocument();
    expect(getByText('You can connect available resources to use their capabilities to complete your reports')).toBeInTheDocument();
  });

  test('matches snapshot', () => {
    const tree = renderer.create(<ConnectionsSection />).toJSON();
    expect(tree).toMatchSnapshot();
  });
})
