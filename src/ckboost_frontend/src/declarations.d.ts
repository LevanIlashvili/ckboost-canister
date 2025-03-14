declare module '../../../declarations/ckboost_backend' {
  export const ckboost_backend: {
    greet: (name: string) => Promise<string>;
  };
} 