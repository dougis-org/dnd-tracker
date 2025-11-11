import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonsterForm } from '@/components/MonsterForm';

const fillRequiredFields = async () => {
  const user = userEvent.setup();

  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'Test Monster' },
  });

  fireEvent.change(screen.getByLabelText(/cr/i), {
    target: { value: '1' },
  });

  fireEvent.change(screen.getByLabelText(/type/i), {
    target: { value: 'fiend' },
  });

  return user;
};

describe('MonsterForm', () => {
  it('shows validation errors for invalid numeric input and prevents submission', async () => {
    const handleSubmit = jest.fn();

    render(<MonsterForm onSubmit={handleSubmit} />);

    const user = await fillRequiredFields();

    const hpInput = screen.getByLabelText(/hp/i);
    fireEvent.change(hpInput, { target: { value: '-1' } });

    await user.click(screen.getByRole('button', { name: /save monster/i }));

    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    expect(await screen.findByText(/hp must be non-negative/i)).toBeInTheDocument();
  });

  it('submits validated monster data and resets validation errors', async () => {
    const handleSubmit = jest.fn();

    render(<MonsterForm onSubmit={handleSubmit} />);

    const user = await fillRequiredFields();

    fireEvent.change(screen.getByLabelText(/hp/i), {
      target: { value: '25' },
    });

    fireEvent.change(screen.getByLabelText(/ac/i), {
      target: { value: '16' },
    });

    await user.selectOptions(screen.getByLabelText(/scope/i), 'global');

    fireEvent.change(screen.getByLabelText(/str/i), {
      target: { value: '15' },
    });

    await user.click(screen.getByRole('button', { name: /save monster/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    const submitted = handleSubmit.mock.calls[0][0];
    expect(submitted.name).toBe('Test Monster');
    expect(submitted.cr).toBe(1);
    expect(submitted.hp).toBe(25);
    expect(submitted.ac).toBe(16);
    expect(submitted.scope).toBe('global');
    expect(submitted.abilities.str).toBe(15);
  });
});
