// O Firestore recusa gravar qualquer campo com valor `undefined`, em qualquer nível do
// objeto (inclusive dentro de arrays) — lança "Unsupported field value: undefined". Campos
// opcionais que viram `undefined` (ex.: clientFantasy vazio, imageUrl de produto sem foto)
// precisam ser removidos antes de chegar em addDoc/setDoc/updateDoc.
export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }

  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([key, v]) => [key, stripUndefinedDeep(v)]);

    return Object.fromEntries(entries) as T;
  }

  return value;
}
