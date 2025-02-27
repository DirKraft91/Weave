# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react';

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
});
```

# Twitter Account Prism Client

This is the client application for the Twitter Account Prism project.

## API Requests with TanStack Query

This project uses [TanStack Query](https://tanstack.com/query/latest) (formerly React Query) for handling API requests. TanStack Query provides a powerful and flexible way to fetch, cache, and update data in your React applications.

### Custom Hooks

We've created a set of custom hooks in `src/hooks/useApiQueries.ts` to encapsulate common API requests:

#### User-related hooks

- `useUserMe()`: Fetches the current user's data
- `useUserByAddress(address)`: Fetches user data by wallet address

#### Proof-related hooks

- `useProviderStats()`: Fetches statistics about providers
- `useApplyProof()`: Mutation for applying a proof
- `usePrepareProof()`: Mutation for preparing a proof
- `useTotalVerifications()`: Calculates the total number of verifications across all providers

### Usage Examples

#### Fetching Data

```tsx
import { useUserMe } from '@/hooks/useApiQueries';

function MyComponent() {
  const { data, isLoading, error } = useUserMe();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Hello, {data?.id}</div>;
}
```

#### Mutations

```tsx
import { useApplyProof } from '@/hooks/useApiQueries';

function MyComponent() {
  const applyProofMutation = useApplyProof();

  const handleApplyProof = async (proofData) => {
    try {
      await applyProofMutation.mutateAsync(proofData);
      // Success handling is done in the mutation hook
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  return (
    <button
      onClick={() => handleApplyProof(myProofData)}
      disabled={applyProofMutation.isPending}
    >
      {applyProofMutation.isPending ? 'Applying...' : 'Apply Proof'}
    </button>
  );
}
```

### Benefits

- **Automatic caching**: Data is cached and only refetched when necessary
- **Automatic refetching**: Data can be configured to refetch on window focus, at intervals, etc.
- **Deduplication**: Multiple components requesting the same data will only trigger one request
- **Background updates**: Data can be updated in the background without blocking the UI
- **Optimistic updates**: UI can be updated optimistically before the server confirms the change
- **Automatic error handling**: Errors are caught and can be handled gracefully
- **Pagination and infinite scrolling**: Built-in support for pagination and infinite scrolling

### Configuration

The global TanStack Query configuration is set in `src/main.tsx`:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchInterval: false,
    },
  },
});
```

Individual queries can override these defaults with their own options.
