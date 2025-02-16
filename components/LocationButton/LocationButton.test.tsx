import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import LocationButton from './LocationButton';
import axios from 'axios';
import { toast } from 'react-hot-toast';

jest.mock('axios');
jest.mock('react-hot-toast');

describe('LocationButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display a success toast with city and state for US or Canada', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: 51.1,
            longitude: 45.3,
          },
        })
      ),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
    });

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: {} }); // Mock log-location API
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { city: 'New York', state: 'NY', country: 'United States' },
    }); // Mock geolocation API

    render(<LocationButton userId="123" />);

    userEvent.click(screen.getByText('Log Location'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Location logged successfully! City: New York, State: NY'
      );
    });
  });

  it('should display an error toast if geolocation fails', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success, error) =>
        error({
          message: 'User denied Geolocation',
        })
      ),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
    });

    render(<LocationButton userId="123" />);

    userEvent.click(screen.getByText('Log Location'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('User denied Geolocation');
    });
  });
});
