// Shared style objects for use across components/pages
export const container = {
  textAlign: 'right' as const,
  fontFamily: 'inherit',
  maxWidth: '100%',
};

export const statsContainer = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '2rem',
  padding: '1.5rem',
  borderRadius: '1rem',
  border: '1px solid var(--ifm-color-primary-lighter)',
};

export const statItem = {
  textAlign: 'center' as const,
  padding: '1rem 2rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--ifm-color-primary-lightest)',
};

export const statNumber = {
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--ifm-color-primary)',
  marginBottom: '0.5rem',
};

export const statLabel = {
  fontSize: '1rem',
  color: 'var(--ifm-color-primary-dark)',
  fontWeight: 500,
}; 