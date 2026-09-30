import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/api"));

const { reducer } = await import("./reducer");
const { graphqlErrors, relayPage, serverError } = await import("@openimis/fe-core/testing");

const initial = () => reducer(undefined, { type: "@@INIT" });
const dispatch = (state, type, payload) => reducer(state, { type, payload });

const SERVER_ERROR = { code: 500, message: "Internal Server Error", detail: "boom" };
const PRODUCT = { id: "1", uuid: "p-1", code: "BASIC", name: "Basic", ceilingType: "INSUREE" };

describe("product reducer", () => {
  describe("initialisation", () => {
    it("starts with no product and no code validation", () => {
      expect(initial()).toEqual({
        fetchingProduct: false,
        product: {},
        fetchedProduct: false,
        errorProduct: null,
        validationFields: null,
      });
    });

    it("returns the same state object for an unrelated action", () => {
      const state = initial();

      expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
  });

  describe("fetching a product", () => {
    const loaded = () => ({
      ...initial(),
      product: PRODUCT,
      fetchedProduct: true,
      errorProduct: SERVER_ERROR,
    });

    it("drops the previous product and error when a fetch starts", () => {
      const state = dispatch(loaded(), "PRODUCT_FETCH_PRODUCT_REQ");

      expect(state).toMatchObject({ fetchingProduct: true, product: {}, fetchedProduct: false, errorProduct: null });
    });

    it("stores the first product of the response", () => {
      const fetching = dispatch(initial(), "PRODUCT_FETCH_PRODUCT_REQ");
      const state = dispatch(fetching, "PRODUCT_FETCH_PRODUCT_RESP", {
        data: { product: relayPage([PRODUCT, { ...PRODUCT, id: "2" }]) },
      });

      expect(state).toMatchObject({ fetchingProduct: false, fetchedProduct: true, errorProduct: null });
      expect(state.product).toEqual(PRODUCT);
    });

    it("records a transport failure and stops fetching", () => {
      const fetching = dispatch(initial(), "PRODUCT_FETCH_PRODUCT_REQ");
      const state = dispatch(fetching, "PRODUCT_FETCH_PRODUCT_ERR", serverError(500, "Internal Server Error", "boom"));

      expect(state.fetchingProduct).toBe(false);
      expect(state.errorProduct).toEqual(SERVER_ERROR);
    });

    it("resets everything on clear", () => {
      const state = dispatch({ ...loaded(), fetchingProduct: true }, "PRODUCT_FETCH_PRODUCT_CLEAR");

      expect(state).toMatchObject({ fetchingProduct: false, product: {}, fetchedProduct: false, errorProduct: null });
    });

    it("leaves the code validation alone", () => {
      const validation = { productCode: { isValidating: false, isValid: true, validationError: null } };
      const state = dispatch({ ...initial(), validationFields: validation }, "PRODUCT_FETCH_PRODUCT_CLEAR");

      expect(state.validationFields).toBe(validation);
    });
  });

  describe("product code validation", () => {
    const withOtherField = () => ({ ...initial(), validationFields: { other: { isValid: true } } });
    const productCode = (state) => state.validationFields.productCode;

    it.each([
      [
        "a check starts",
        "PRODUCT_CODE_FIELDS_VALIDATION_REQ",
        undefined,
        { isValidating: true, isValid: false, validationError: null },
      ],
      [
        "the code is free",
        "PRODUCT_CODE_FIELDS_VALIDATION_RESP",
        { data: { isValid: true } },
        { isValidating: false, isValid: true, validationError: null },
      ],
      [
        "the code is taken",
        "PRODUCT_CODE_FIELDS_VALIDATION_RESP",
        { data: { isValid: false } },
        { isValidating: false, isValid: false, validationError: null },
      ],
      [
        "the code is marked valid without a check",
        "PRODUCT_CODE_SET_VALID",
        undefined,
        { isValidating: false, isValid: true, validationError: null },
      ],
    ])("records the result when %s", (_label, type, payload, expected) => {
      const state = dispatch(withOtherField(), type, payload);

      expect(productCode(state)).toEqual(expected);
      expect(state.validationFields.other).toEqual({ isValid: true });
    });

    it("reports a data error returned alongside the result", () => {
      const state = dispatch(initial(), "PRODUCT_CODE_FIELDS_VALIDATION_RESP", {
        data: { isValid: null },
        ...graphqlErrors("no permission"),
      });

      expect(productCode(state)).toEqual({
        isValidating: false,
        isValid: null,
        validationError: { code: "Data error", message: "Server returned data error status", detail: "no permission" },
      });
    });

    // Currently fails: the reducer reads action.payload?.data.isValid, and a GraphQL
    // error response that carries no data makes that throw a TypeError.
    it.fails("reports a GraphQL error that came without data", () => {
      const validating = dispatch(initial(), "PRODUCT_CODE_FIELDS_VALIDATION_REQ");
      const state = dispatch(validating, "PRODUCT_CODE_FIELDS_VALIDATION_RESP", graphqlErrors("bad query"));

      expect(productCode(state)).toMatchObject({ isValidating: false, validationError: { detail: "bad query" } });
    });

    it("treats a transport failure as invalid and keeps the error", () => {
      const validating = dispatch(initial(), "PRODUCT_CODE_FIELDS_VALIDATION_REQ");
      const state = dispatch(
        validating,
        "PRODUCT_CODE_FIELDS_VALIDATION_ERR",
        serverError(500, "Internal Server Error", "boom"),
      );

      expect(productCode(state)).toEqual({ isValidating: false, isValid: false, validationError: SERVER_ERROR });
    });

    it("forgets the verdict and the error on clear", () => {
      const failed = dispatch(
        initial(),
        "PRODUCT_CODE_FIELDS_VALIDATION_ERR",
        serverError(500, "Internal Server Error", "boom"),
      );
      const state = dispatch(failed, "PRODUCT_CODE_FIELDS_VALIDATION_CLEAR");

      expect(productCode(state)).toMatchObject({ isValid: false, validationError: null });
    });

    // Currently fails: the clear branch sets isValidating to true, as if a new check had started.
    it.fails("stops validating on clear", () => {
      const validating = dispatch(initial(), "PRODUCT_CODE_FIELDS_VALIDATION_REQ");
      const state = dispatch(validating, "PRODUCT_CODE_FIELDS_VALIDATION_CLEAR");

      expect(productCode(state).isValidating).toBe(false);
    });

    it("does not touch the fetched product", () => {
      const loaded = { ...initial(), product: PRODUCT, fetchedProduct: true };
      const state = dispatch(loaded, "PRODUCT_CODE_FIELDS_VALIDATION_REQ");

      expect(state.product).toBe(PRODUCT);
      expect(state.fetchedProduct).toBe(true);
    });
  });
});
