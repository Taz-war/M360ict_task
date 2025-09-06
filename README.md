# Multi-Step Form Application

A React-based multi-step form application with comprehensive validation, dynamic business rules, and optimistic UI updates.

## Features

- **Multi-step form navigation** with progress tracking
- **Complex validation logic** including phone format, salary ranges, and business rules
- **Dynamic field filtering** based on department and job type selections
- **Manager approval workflow** with conditional requirements
- **Weekend restriction validation** for specific departments
- **Auto-save functionality** with optimistic UI updates
- **Error boundaries** for robust error handling
- **Responsive design** with modern UI components
- **Optimistic UI updates** for instant feedback and smooth interactions
- **Visual save indicators** showing real-time save status

## How to Run the Project

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd multi-step-form
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── form-steps/           # Individual form step components
│   │   ├── PersonalInfoStep.jsx
│   │   ├── JobDetailsStep.jsx
│   │   ├── SkillsPreferencesStep.jsx
│   │   ├── EmergencyContactStep.jsx
│   │   └── ReviewSubmitStep.jsx
│   ├── ui/                   # Reusable UI components
│   └── MultiStepForm.jsx     # Main form orchestrator
├── hooks/                    # Custom React hooks
│   ├── useFormValidation.js
│   └── useAutoSave.js
├── lib/
│   └── form-schema.js        # Zod validation schemas
└── data/
    └── mockData.js          # Mock data for managers and skills
```

## Complex Logic Implementation

### 1. Phone Number Validation

**Challenge**: Support both local and international Bangladesh phone formats.

**Solution**: Implemented regex pattern matching for:

- Local format: `01537454231`
- International format: `+8801537454231`

```javascript
phone: z.string().regex(/^(\+880|880|0)?1[3-9]\d{8}$/, "Please enter a valid Bangladesh phone number");
```

### 2. Dynamic Salary Range Validation

**Challenge**: Different job types have different salary expectations.

**Solution**: Context-aware validation that adjusts salary ranges based on job type selection:

```javascript
const getSalaryRange = (jobType) => {
  const ranges = {
    "full-time": { min: 30000, max: 200000 },
    "part-time": { min: 15000, max: 80000 },
    contract: { min: 40000, max: 300000 },
    internship: { min: 10000, max: 25000 },
  };
  return ranges[jobType] || ranges["full-time"];
};
```

### 3. Manager Approval Logic

**Challenge**: Determine when manager approval is required based on salary and job type.

**Solution**: Business rule implementation:

- Full-time positions > 100,000 BDT require approval
- Contract positions > 150,000 BDT require approval
- Part-time and internship positions don't require approval

### 4. Weekend Start Date Restrictions

**Challenge**: HR and Finance departments cannot start employees on weekends.

**Solution**: Date validation with department-specific business rules:

```javascript
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

// Applied conditionally based on department selection
```

### 5. Department-Based Filtering

**Challenge**: Show relevant managers and skills based on selected department.

**Solution**: Dynamic filtering system:

- Managers filtered by department hierarchy
- Skills filtered by department relevance
- Real-time updates when department changes

### 6. Step-by-Step Validation

**Challenge**: Prevent navigation to next step with invalid data while allowing backward navigation.

**Solution**: Custom validation hook that:

- Validates current step before allowing forward navigation
- Maintains validation state across steps
- Provides real-time feedback on form completion status

### 7. Optimistic UI Implementation

**Challenge**: Provide instant feedback for user actions without waiting for async operations.

**Solution**: Multi-layered optimistic update system:

- **Form navigation**: Immediate step transitions with validation rollback
- **Auto-save**: Instant save status updates with error recovery
- **Field updates**: Real-time validation feedback with debouncing
- **Form submission**: Optimistic success states with proper error handling

```javascript
const { performOptimisticUpdate } = useOptimisticUpdates();

await performOptimisticUpdate("formSubmission", { status: "submitting" }, async () => submitToAPI(data), {
  onSuccess: (result) => showSuccessMessage(),
  onError: (error) => revertAndShowError(error),
});
```

## Custom Hooks

### useFormValidation

Manages form validation state across multiple steps:

- Tracks validation status for each step
- Provides methods to validate individual steps
- Maintains overall form validity state
- Optimistic validation updates for smooth UX

### useFormPersistence (Enhanced Auto-Save)

Enhanced auto-save functionality with comprehensive state management:

- Auto-saves form data to localStorage with debouncing
- Provides visual feedback for save operations
- Handles save errors gracefully with retry mechanisms
- Loads saved data on component mount
- Warns users before leaving with unsaved changes

### useStepNavigation

Advanced step navigation with optimistic updates:

- Manages current step state and navigation history
- Supports optimistic navigation (immediate UI updates)
- Validation caching for improved performance
- Flexible navigation options (forward, backward, direct)
- Error handling and rollback capabilities

### useOptimisticUpdates

Generic hook for optimistic UI patterns:

- Immediate UI updates before async operations complete
- Automatic rollback on operation failure
- Loading state management with configurable delays
- Support for multiple concurrent optimistic updates
- Error handling with custom recovery strategies

### useAsyncOperation

Robust async operation management:

- Automatic retry logic with exponential backoff
- Operation cancellation and timeout handling
- Loading and error state management
- Abort controller integration for cleanup

### useOptimisticField

Field-level optimistic updates:

- Real-time field validation with visual feedback
- Optimistic value updates during async operations
- Debounced validation to reduce API calls
- Transform functions for value processing
- Rollback capabilities on validation errors

## Assumptions Made

### 1. Business Rules

- **Salary Currency**: All salary amounts are in Bangladesh Taka (BDT)
- **Phone Format**: Primary focus on Bangladesh phone number formats
- **Weekend Definition**: Saturday and Sunday are considered weekends
- **Manager Hierarchy**: Managers can approve for their own department and sub-departments

### 2. User Experience

- **Auto-save Frequency**: Form data is saved every 2 seconds when modified
- **Validation Timing**: Real-time validation on field blur, with submit-time validation as fallback
- **Navigation**: Users can navigate backward freely but must validate before moving forward

### 3. Data Structure

- **Department Hierarchy**: Flat structure with department codes (HR, IT, FIN, MKT, OPS)
- **Skills Categorization**: Skills are tagged with relevant departments
- **Manager Assignment**: Each manager belongs to one primary department

### 4. Technical Assumptions

- **Browser Support**: Modern browsers with ES6+ support
- **Local Storage**: Available for auto-save functionality
- **Network**: Form submission simulated (no actual backend integration)

### 5. Validation Rules

- **Required Fields**: All fields marked as required must be completed
- **Email Format**: Standard email validation using built-in browser validation
- **Date Ranges**: Start dates must be in the future (after today)
- **Salary Minimums**: Based on Bangladesh minimum wage considerations

## Error Handling & Boundaries

The application includes comprehensive error handling with multiple layers of protection:

### Error Boundaries

- **Application-level Error Boundary**: Catches any unhandled React errors
- **Form-specific Error Boundary**: Specialized error handling for form operations
- **Graceful error recovery** with user-friendly messages
- **Form data preservation** during error states
- **Multiple recovery options** (retry, reset, save & retry)

### Error Handling Features

- **Field-level validation** with immediate feedback and optimistic updates
- **Step-level validation** preventing invalid navigation with rollback
- **Form-level validation** on final submission with retry logic
- **Auto-save error handling** with automatic retry mechanisms
- **Network error recovery** with exponential backoff
- **Operation cancellation** to prevent race conditions
- **Timeout handling** for long-running operations

## Future Enhancements

Potential improvements for production use:

- Backend API integration for data persistence
- File upload capabilities for documents
- Email notifications for manager approvals
- Advanced reporting and analytics
- Multi-language support
- Accessibility improvements (WCAG compliance)
- Unit and integration tests
