type WithoutIsLocked<T> = T extends (infer U)[]
  ? WithoutIsLocked<U>[]
  : T extends object
    ? {
        [K in keyof T as K extends 'isLocked' ? never : K]: WithoutIsLocked<
          T[K]
        >;
      }
    : T;

function stripIsLocked<T>(value: T): WithoutIsLocked<T> {
  if (value === null || value === undefined) {
    return value as WithoutIsLocked<T>;
  }
  if (Array.isArray(value)) {
    return value.map(stripIsLocked) as WithoutIsLocked<T>;
  }
  if (value instanceof Date) {
    return value as unknown as WithoutIsLocked<T>;
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      if (key === 'isLocked') continue;
      result[key] = stripIsLocked((value as Record<string, unknown>)[key]);
    }
    return result as WithoutIsLocked<T>;
  }
  return value as WithoutIsLocked<T>;
}

function transformAwakeUrls<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map(transformAwakeUrls) as unknown as T;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(obj)) {
      if (key === 'awakeBeforeUrl' || key === 'awakeAfterUrl') continue;
      if (key === 'awakeBeforeStorageUrl') {
        result['awakeBeforeUrl'] = obj[key];
        continue;
      }
      if (key === 'awakeAfterStorageUrl') {
        result['awakeAfterUrl'] = obj[key];
        continue;
      }
      result[key] = transformAwakeUrls(obj[key]);
    }

    return result as unknown as T;
  }
  return value;
}

export function serialize<T>(data: T): WithoutIsLocked<T> {
  return stripIsLocked(data);
}

function stripDetailAccessories<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map(stripDetailAccessories) as unknown as T;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (
        key === 'detail' &&
        obj[key] !== null &&
        typeof obj[key] === 'object' &&
        !(obj[key] instanceof Date)
      ) {
        const detail = obj[key] as Record<string, unknown>;
        const detailWithout: Record<string, unknown> = {};
        for (const dk of Object.keys(detail)) {
          if (dk === 'accessories') continue;
          detailWithout[dk] = stripDetailAccessories(detail[dk]);
        }
        result[key] = detailWithout;
      } else {
        result[key] = stripDetailAccessories(obj[key]);
      }
    }
    return result as unknown as T;
  }
  return value;
}

export function serializeCard<T>(data: T): WithoutIsLocked<T> {
  return stripIsLocked(transformAwakeUrls(stripDetailAccessories(data)));
}
