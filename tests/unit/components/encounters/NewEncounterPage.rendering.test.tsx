 
import { render, screen } from '@testing-library/react'
import NewEncounterPage from '@/app/encounters/new/page'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

jest.mock('@/lib/api/encounters', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    list: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('NewEncounterPage - Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders page title', () => {
    render(<NewEncounterPage />)
    expect(screen.getByText('Create New Encounter')).toBeInTheDocument()
  })

  it('renders all form sections', () => {
    render(<NewEncounterPage />)
    expect(screen.getByLabelText('Encounter Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument()
    expect(screen.getByText('Participants *')).toBeInTheDocument()
  })

  it('renders Save and Cancel buttons', () => {
    render(<NewEncounterPage />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders Add Participant button', () => {
    render(<NewEncounterPage />)
    expect(screen.getByRole('button', { name: 'Add Participant' })).toBeInTheDocument()
  })

  it('initializes with one empty participant', () => {
    render(<NewEncounterPage />)
    expect(screen.getByText('Participant 1')).toBeInTheDocument()
  })

  it('has container with correct styling', () => {
    const { container } = render(<NewEncounterPage />)
    const mainDiv = container.querySelector('div.container')
    expect(mainDiv).toHaveClass('mx-auto', 'px-4', 'py-8', 'max-w-2xl')
  })

  it('has encounter name field with placeholder', () => {
    render(<NewEncounterPage />)
    expect(screen.getByPlaceholderText('e.g., Goblin Ambush')).toBeInTheDocument()
  })

  it('has description field with placeholder', () => {
    render(<NewEncounterPage />)
    expect(screen.getByPlaceholderText('Notes about this encounter...')).toBeInTheDocument()
  })

  it('has description textarea with 3 rows', () => {
    const { container } = render(<NewEncounterPage />)
    const textarea = container.querySelector('textarea[name="description"]')
    expect(textarea).toHaveAttribute('rows', '3')
  })

  it('marks Encounter Name as required', () => {
    render(<NewEncounterPage />)
    expect(screen.getByLabelText('Encounter Name *')).toBeInTheDocument()
  })

  it('marks Description as optional', () => {
    render(<NewEncounterPage />)
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument()
    expect(screen.queryByLabelText('Description *')).not.toBeInTheDocument()
  })

  it('marks Participants as required', () => {
    render(<NewEncounterPage />)
    expect(screen.getByText('Participants *')).toBeInTheDocument()
  })
})
