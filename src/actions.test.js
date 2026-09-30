import { describe, expect, it, vi } from "vitest";

const core = vi.hoisted(() => ({
  graphqlWithVariables: vi.fn((operation, variables, type, meta) => ({ operation, variables, type, meta })),
}));

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => ({
  ...(await vi.importActual("@openimis/fe-core/helpers/api")),
  ...core,
}));

const actions = await import("./actions");
const { reducer } = await import("./reducer");

const modulesManager = {};
const operation = (result) => result.operation.replace(/\s+/g, " ");

const dispatched = (thunk) => {
  const dispatch = vi.fn();
  thunk(dispatch);
  return dispatch.mock.calls.map(([action]) => action);
};

describe("product actions", () => {
  describe("productCodeValidationCheck", () => {
    it("asks the server whether the code is free", () => {
      const result = actions.productCodeValidationCheck(modulesManager, { productCode: "BASIC" });

      expect(result.type).toBe("PRODUCT_CODE_FIELDS_VALIDATION");
      expect(result.variables).toEqual({ productCode: "BASIC" });
      expect(operation(result)).toContain(
        "query ($productCode: String!) { isValid: validateProductCode(productCode: $productCode) }",
      );
    });
  });

  describe("fetchProduct", () => {
    it("fetches one product by id with the fields the form needs", () => {
      const result = actions.fetchProduct(modulesManager, { productId: "42" });

      expect(result.type).toBe("PRODUCT_FETCH_PRODUCT");
      expect(result.variables).toEqual({ productId: "42" });
      expect(operation(result)).toContain("query ($productId: ID) { product: products(id: $productId)");
      expect(operation(result)).toContain("edges { node { id uuid code name ceilingType } }");
    });
  });

  it.each([
    ["productCodeSetValid", "PRODUCT_CODE_SET_VALID"],
    ["productCodeValidationClear", "PRODUCT_CODE_FIELDS_VALIDATION_CLEAR"],
    ["clearProduct", "PRODUCT_FETCH_PRODUCT_CLEAR"],
  ])("%s dispatches %s once, and the reducer handles it", (creator, type) => {
    const actionsDispatched = dispatched(actions[creator]());
    const state = reducer(undefined, { type: "@@INIT" });

    expect(actionsDispatched).toEqual([{ type }]);
    expect(reducer(state, actionsDispatched[0])).not.toBe(state);
  });
});
