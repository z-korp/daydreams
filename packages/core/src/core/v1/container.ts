type Constructor<T> = new (...args: any[]) => T;
type Factory<T> = (container: Container) => T;
type FunctionType = (...args: any[]) => any;
type Token = string | symbol | Constructor<any> | FunctionType;

// Type utility to extract the return type of a function
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

export interface Container {
  register: <T>(token: Token, factory: Factory<T>) => void;
  singleton: <T>(token: Token, factory: Factory<T>) => void;
  instance: <T>(token: Token, instance: T) => void;
  resolve: <T>(token: Token) => T;
}

export const createContainer = (): Container => {
  const instances = new Map<Token, any>();
  const factories = new Map<Token, Factory<any>>();
  const singletons = new Set<Token>();

  const getTokenString = (token: Token): string => {
    if (typeof token === "string") return token;
    if (typeof token === "symbol") return token.toString();
    if (typeof token === "function") {
      return token.name || "anonymous function";
    }
    return "unknown token";
  };

  const container: Container = {
    register: <T>(token: Token, factory: Factory<T>): void => {
      factories.set(token, factory);
      instances.delete(token);
    },

    singleton: <T>(token: Token, factory: Factory<T>): void => {
      factories.set(token, factory);
      singletons.add(token);
      instances.delete(token);
    },

    instance: <T>(token: Token, value: T): void => {
      instances.set(token, value);
      factories.delete(token);
      singletons.delete(token);
    },

    resolve: <T>(token: Token): T => {
      if (instances.has(token)) {
        return instances.get(token);
      }

      const factory = factories.get(token);
      if (!factory) {
        throw new Error(`No registration found for ${getTokenString(token)}`);
      }

      if (singletons.has(token)) {
        if (!instances.has(token)) {
          instances.set(token, factory(container));
        }
        return instances.get(token);
      }

      return factory(container);
    },
  };

  return container;
};

export default createContainer;
