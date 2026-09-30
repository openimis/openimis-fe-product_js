import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const core = vi.hoisted(() => ({
  useGraphqlQuery: vi.fn(),
  useGraphqlMutation: vi.fn((operation, options) => ({ operation, options })),
  useModulesManager: vi.fn(() => ({ getRef: (key) => `#ref:${key}` })),
}));

vi.mock("@openimis/fe-core", () => core);

const hooks = await import("./hooks");
const { relayPage } = await import("@openimis/fe-core/testing");

const refetch = () => {};
const answer = (data, extra = {}) => {
  core.useGraphqlQuery.mockReturnValue({ isLoading: false, error: null, data, refetch, ...extra });
};
const lastQuery = () => core.useGraphqlQuery.mock.calls.at(-1);
const normalised = (text) => text.replace(/\s+/g, " ");

beforeEach(() => {
  core.useGraphqlQuery.mockReset();
  core.useGraphqlMutation.mockClear();
});

describe("useProductsQuery", () => {
  const PRODUCTS = [
    { id: "1", code: "A" },
    { id: "2", code: "B" },
  ];

  it("flattens the page and merges the total into the page info", () => {
    answer({ products: relayPage(PRODUCTS, { totalCount: 12, pageInfo: { hasNextPage: true, endCursor: "c2" } }) });

    const { result } = renderHook(() => hooks.useProductsQuery({ filters: { first: 2 } }, { skip: true }));

    expect(result.current.data.products).toEqual(PRODUCTS);
    expect(result.current.data.pageInfo).toMatchObject({ totalCount: 12, hasNextPage: true, endCursor: "c2" });
    expect(result.current.refetch).toBe(refetch);
  });

  it("returns an empty list and page info before data arrives", () => {
    answer(null, { isLoading: true });

    const { result } = renderHook(() => hooks.useProductsQuery({ filters: {} }));

    expect(result.current).toMatchObject({ isLoading: true, data: { products: [], pageInfo: {} } });
  });

  it("passes the filters as variables and the config through", () => {
    answer(null);
    const filters = { code: "A", first: 10 };

    renderHook(() => hooks.useProductsQuery({ filters }, { skip: true }));

    const [operation, variables, config] = lastQuery();
    expect(variables).toBe(filters);
    expect(config).toEqual({ skip: true });
    expect(normalised(operation)).toContain("code_Icontains: $code");
    expect(normalised(operation)).toContain("dateFrom_Lte: $dateFrom, dateTo_Gte: $dateTo");
    expect(operation).toContain("#ref:product.hooks.useProductsQuery.productFragment");
  });
});

describe("useProductQuery", () => {
  it("fetches one product by id or uuid and returns it", () => {
    const product = { id: "1", uuid: "p-1" };
    answer({ product });

    const { result } = renderHook(() => hooks.useProductQuery({ uuid: "p-1" }, { skip: false }));

    const [operation, variables, config] = lastQuery();
    expect(variables).toEqual({ id: undefined, uuid: "p-1" });
    expect(config).toEqual({ skip: false });
    expect(normalised(operation)).toContain("product(id: $id, uuid: $uuid) { id ...ProductFragment }");
    expect(operation).toContain("#ref:product.hooks.useProductQuery.productFragment");
    expect(result.current.data).toBe(product);
  });
});

describe.each([
  [
    "usePageDisplayRulesQuery",
    "pageDisplayRules { minLimitValue maxLimitValue",
    { isLoadingRules: "isLoading", errorRules: "error", refetchRules: "refetch", dataRules: "data" },
  ],
  [
    "useLimitDefaultsQuery",
    "limitDefaults { defaultPriceOrigin defaultLimit defaultLimitCoInsuranceValue defaultLimitFixedValue",
    {
      isLoadingLimitDefaults: "isLoading",
      errorLimitDefaults: "error",
      refetchLimitDefaults: "refetch",
      dataLimitDefaults: "data",
    },
  ],
])("%s", (hook, fragment, renamed) => {
  it("sends no variables and hands the config to the query", () => {
    answer(null);

    renderHook(() => hooks[hook]({ skip: true }));

    const [operation, variables, config] = lastQuery();
    expect(normalised(operation)).toContain(fragment);
    expect(variables).toEqual({});
    expect(config).toEqual({ skip: true });
  });

  it("renames the query state for its callers", () => {
    const state = { isLoading: false, error: "e", data: { any: 1 }, refetch };
    core.useGraphqlQuery.mockReturnValue(state);

    const { result } = renderHook(() => hooks[hook]());

    Object.entries(renamed).forEach(([key, source]) => expect(result.current[key]).toBe(state[source]));
  });
});

describe.each([
  ["useProductCreateMutation", "CreateProductMutationInput", "createProduct"],
  ["useProductUpdateMutation", "UpdateProductMutationInput", "updateProduct"],
  ["useProductDuplicateMutation", "DuplicateProductMutationInput", "duplicateProduct"],
  ["useProductDeleteMutation", "DeleteProductMutationInput", "deleteProduct"],
])("%s", (hook, inputType, field) => {
  it(`runs ${field} and resolves with its result`, () => {
    const { result } = renderHook(() => hooks[hook]());
    const { operation, options } = result.current;

    expect(normalised(operation)).toContain(`mutation ($input: ${inputType}!) { ${field}(input: $input) {`);
    expect(options.onSuccess({ [field]: { internalId: "7" } })).toEqual({ internalId: "7" });
    expect(options.onSuccess(undefined)).toBeUndefined();
  });
});
