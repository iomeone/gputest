import React from 'react';

export const FALLBACK_MESSAGE = (error: Error) =>
  <div className="error-message">{error.toString()}</div>;