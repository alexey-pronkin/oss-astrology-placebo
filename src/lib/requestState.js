export const createIdleRequestState = (message) => ({
  stage: 'idle',
  message,
  activeTemplate: '',
  completed: 0,
  total: 0,
})

export const createRunningRequestState = ({
  message,
  total,
  activeTemplate = '',
}) => ({
  stage: 'running',
  message,
  activeTemplate,
  completed: 0,
  total,
})

export const createSuccessfulRequestState = (previousState, message) => ({
  ...previousState,
  stage: 'success',
  message,
  activeTemplate: '',
  completed: previousState.total || previousState.completed,
})

export const createFailedRequestState = (previousState, message) => ({
  ...previousState,
  stage: 'error',
  message,
  activeTemplate: '',
})

export const updateRequestProgressState = (previousState, updates) => ({
  ...previousState,
  ...updates,
})

export const getRequestProgress = (requestState) =>
  requestState.total > 0
    ? Math.round((requestState.completed / requestState.total) * 100)
    : 0

