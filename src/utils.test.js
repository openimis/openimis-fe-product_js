import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const core = vi.hoisted(() => ({
  graphqlWithVariables: vi.fn((operation, variables) => ({ operation, variables })),
}));

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => ({
  toISODate: (await vi.importActual("@openimis/fe-core/helpers/i18n")).toISODate,
  ...core,
}));

const utils = await import("./utils");
const { relayPage } = await import("@openimis/fe-core/testing");

const RULES = { minLimitValue: 0, maxLimitValue: 100 };
const LIMITS = {
  limitAdult: 100,
  limitAdultR: 80,
  limitAdultE: 50.5,
  limitChild: 100,
  limitChildR: 80,
  limitChildE: 0,
};

const validProduct = (overrides = {}) => ({
  code: "BASIC",
  name: "Basic cover",
  maxMembers: 5,
  insurancePeriod: 12,
  gracePeriodPayment: 1,
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  ceilingInterpretation: "HEALTH_FACILITY_TYPE",
  ...overrides,
});

let warn;
let error;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  core.graphqlWithVariables.mockClear();
});

describe("validateProductForm", () => {
  const validate = (overrides) => utils.validateProductForm(validProduct(overrides), RULES, true);

  it("accepts a complete product without warning", () => {
    expect(validate({})).toBe(true);
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([
    "code",
    "name",
    "maxMembers",
    "insurancePeriod",
    "gracePeriodPayment",
    "dateFrom",
    "dateTo",
    "ceilingInterpretation",
  ])("requires %s", (field) => {
    expect(validate({ [field]: undefined })).toBe(false);
    expect(validate({ [field]: "" })).toBe(false);
  });

  it.each(["maxMembers", "insurancePeriod", "gracePeriodPayment"])("accepts zero for %s", (field) => {
    expect(validate({ [field]: 0 })).toBe(true);
  });

  it("rejects a product that has been retired", () => {
    expect(validate({ validityTo: "2026-06-01T00:00:00" })).toBe(false);
  });

  it("ignores the validity start", () => {
    expect(validate({ validityFrom: "2026-01-01T00:00:00" })).toBe(true);
  });

  it("does not strip the validity fields from the values it is given", () => {
    const values = validProduct({ validityFrom: "2026-01-01T00:00:00", validityTo: null });

    utils.validateProductForm(values, RULES, true);

    expect(values).toHaveProperty("validityFrom", "2026-01-01T00:00:00");
    expect(values).toHaveProperty("validityTo", null);
  });

  it.each([
    ["ends before it starts", { dateFrom: "2026-12-31", dateTo: "2026-01-01" }, false],
    ["starts and ends on the same day", { dateFrom: "2026-01-01", dateTo: "2026-01-01" }, true],
    ["has a maximum age below the minimum", { ageMinimal: 18, ageMaximal: 16 }, false],
    ["has equal age bounds", { ageMinimal: 18, ageMaximal: 18 }, true],
    ["has a code at the length limit", { code: "ABCDEFGH" }, true],
    ["has a code over the length limit", { code: "ABCDEFGHI" }, false],
  ])("judges a product that %s", (_label, overrides, expected) => {
    expect(validate(overrides)).toBe(expected);
  });

  it.each([false, undefined, null])("rejects the product while the code check says %s", (isValid) => {
    expect(utils.validateProductForm(validProduct(), RULES, isValid)).toBe(false);
  });

  it.each(["items", "services"])("checks the limits of every row in %s", (field) => {
    expect(validate({ [field]: [LIMITS, LIMITS] })).toBe(true);
    expect(validate({ [field]: [LIMITS, { ...LIMITS, limitChildR: 12.345 }] })).toBe(false);
  });

  it("does not look at limits when there are no rows", () => {
    expect(validate({ items: [], services: [] })).toBe(true);
  });

  it("warns with the failing fields", () => {
    validate({ name: "" });

    expect(warn).toHaveBeenCalledWith(expect.objectContaining({ name: true }));
  });
});

describe("validateItemOrService", () => {
  it.each([
    ["a whole number", 80],
    ["zero", 0],
    ["one decimal", 12.5],
    ["two decimals", 12.25],
    ["a numeric string", "12.25"],
  ])("accepts %s", (_label, value) => {
    expect(utils.validateItemOrService({ limitAdult: value }, "limitAdult", RULES)).toBe(true);
  });

  it.each([
    ["three decimals", 12.345],
    ["a negative number", -1],
    ["text", "abc"],
    ["an empty string", ""],
    ["null", null],
    ["a missing value", undefined],
  ])("rejects %s", (_label, value) => {
    expect(utils.validateItemOrService({ limitAdult: value }, "limitAdult", RULES)).toBe(false);
  });
});

describe("getLimitType", () => {
  it.each([
    ["F", "FIXED_AMOUNT"],
    ["C", "CO_INSURANCE"],
    ["X", "CO_INSURANCE"],
    [undefined, "CO_INSURANCE"],
  ])("maps %s to %s", (code, expected) => {
    expect(utils.getLimitType(code)).toBe(expected);
  });
});

describe("getPriceOrigin", () => {
  it.each([
    ["P", "PRICELIST"],
    ["O", "PROVIDER"],
    ["R", "RELATIVE"],
    ["X", "PRICELIST"],
    [undefined, "PRICELIST"],
  ])("maps %s to %s", (code, expected) => {
    expect(utils.getPriceOrigin(code)).toBe(expected);
  });
});

describe("toFormValues", () => {
  it("fills in defaults for a new product", () => {
    expect(utils.toFormValues({})).toEqual({
      code: "",
      lumpSum: 0,
      ageMaximal: 0,
      ageMinimal: 0,
      maxMembers: 0,
      insurancePeriod: 12,
      gracePeriodPayment: 0,
      gracePeriodEnrolment: 0,
      gracePeriodRenewal: 0,
      ceilingInterpretation: "HEALTH_FACILITY_TYPE",
    });
  });

  it("keeps the values of an existing product, including zeros", () => {
    const product = {
      uuid: "p-1",
      code: "BASIC",
      insurancePeriod: 0,
      ceilingInterpretation: "CLAIM_TYPE",
      maxMembers: 7,
    };

    expect(utils.toFormValues(product)).toMatchObject(product);
  });

  it("blanks the code but keeps everything else when duplicating", () => {
    const values = utils.toFormValues({ uuid: "p-1", code: "BASIC", name: "Basic" }, true);

    expect(values).toMatchObject({ uuid: "p-1", code: "", name: "Basic" });
  });
});

describe("rulesToFormValues", () => {
  it.each([
    ["no rules", undefined, 0, 100],
    ["empty rules", {}, 0, 100],
    ["null bounds", { minLimitValue: null, maxLimitValue: null }, 0, 100],
    ["decimal strings from the server", { minLimitValue: "10.00", maxLimitValue: "90.50" }, 10, 90.5],
    ["zero bounds", { minLimitValue: "0", maxLimitValue: 0 }, 0, 0],
  ])("reads %s", (_label, rules, min, max) => {
    expect(utils.rulesToFormValues(rules)).toEqual({ ...rules, minLimitValue: min, maxLimitValue: max });
  });
});

describe("toInputValues", () => {
  const ROW_LIMITS = { limitNoAdult: "2", limitNoChild: "", waitingPeriodAdult: "3", waitingPeriodChild: "" };

  const formValues = (overrides = {}) => ({
    id: "42",
    uuid: "p-1",
    code: "BASIC",
    name: "Basic",
    lumpSum: 100,
    ageMinimal: 0,
    ageMaximal: 65,
    location: { id: "7", uuid: "loc-1" },
    conversionProduct: { id: "8", uuid: "p-2" },
    validityFrom: "2026-01-01T00:00:00",
    validityTo: null,
    dateFrom: "2026-01-01T00:00:00",
    dateTo: "2026-12-31T00:00:00",
    ceilingType: "INSUREE",
    maxInstallments: "3",
    ...overrides,
  });

  it("turns form values into the mutation input", () => {
    expect(utils.toInputValues(formValues())).toEqual({
      uuid: "p-1",
      code: "BASIC",
      name: "Basic",
      lumpSum: 100,
      ageMinimal: 0,
      ageMaximal: 65,
      locationUuid: "loc-1",
      conversionProductUuid: "p-2",
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
      ceilingType: "INSUREE",
      maxInstallments: 3,
      items: undefined,
      services: undefined,
    });
  });

  it.each([
    [
      "no location or conversion product",
      { location: null, conversionProduct: undefined },
      { locationUuid: undefined, conversionProductUuid: undefined },
    ],
    ["no dates", { dateFrom: null, dateTo: undefined }, { dateFrom: null, dateTo: null }],
    ["no instalment limit", { maxInstallments: "" }, { maxInstallments: null }],
  ])("handles %s", (_label, overrides, expected) => {
    expect(utils.toInputValues(formValues(overrides))).toMatchObject(expected);
  });

  it("leaves rows out unless they were edited", () => {
    const input = utils.toInputValues(formValues({ items: [{}], services: [{}] }));

    expect(input.items).toBeUndefined();
    expect(input.services).toBeUndefined();
  });

  it.each([
    ["items", "hasEditedItems", "item", "itemUuid"],
    ["services", "hasEditedServices", "service", "serviceUuid"],
  ])("sends edited %s by uuid with numeric limits", (field, flag, entity, uuidKey) => {
    const row = {
      id: "row-1",
      [entity]: { id: "9", uuid: `${entity}-9` },
      priceOrigin: "PRICELIST",
      limitAdult: 80,
      ...ROW_LIMITS,
    };

    const input = utils.toInputValues(formValues({ [field]: [row], [flag]: true }));

    expect(input[field]).toEqual([
      {
        [uuidKey]: `${entity}-9`,
        priceOrigin: "PRICELIST",
        limitAdult: 80,
        limitNoAdult: 2,
        limitNoChild: null,
        waitingPeriodAdult: 3,
        waitingPeriodChild: null,
      },
    ]);
    expect(input).not.toHaveProperty(flag);
  });
});

describe("fetchConnection", () => {
  it("returns a single page as is", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [1, 2], pageInfo: { hasNextPage: false } });

    await expect(utils.fetchConnection(fetchFn)).resolves.toEqual([1, 2]);
    expect(fetchFn).toHaveBeenCalledWith({});
  });

  it("follows the end cursor until the last page", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ data: [1], pageInfo: { hasNextPage: true, endCursor: "c1" } })
      .mockResolvedValueOnce({ data: [2], pageInfo: { hasNextPage: true, endCursor: "c2" } })
      .mockResolvedValueOnce({ data: [3], pageInfo: { hasNextPage: false, endCursor: "c3" } });

    await expect(utils.fetchConnection(fetchFn)).resolves.toEqual([1, 2, 3]);
    expect(fetchFn.mock.calls).toEqual([[{}], [{ after: "c1" }], [{ after: "c2" }]]);
  });

  it("logs and rethrows a failing page", async () => {
    const failure = new Error("boom");
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ data: [1], pageInfo: { hasNextPage: true, endCursor: "c1" } })
      .mockRejectedValueOnce(failure);

    await expect(utils.fetchConnection(fetchFn)).rejects.toBe(failure);
    expect(error).toHaveBeenCalledWith(failure);
  });
});

describe.each([
  ["loadProductItems", "items", "item"],
  ["loadProductServices", "services", "service"],
])("%s", (loader, field, entity) => {
  const row = (id) => ({ id, [entity]: { uuid: `${entity}-${id}` } });
  const page = (nodes, pageInfo) => ({ payload: { data: { product: { [field]: relayPage(nodes, { pageInfo }) } } } });

  it(`walks every page of the product's ${field}`, async () => {
    const dispatch = vi
      .fn()
      .mockResolvedValueOnce(page([row("1"), row("2")], { hasNextPage: true, endCursor: "c1" }))
      .mockResolvedValueOnce(page([row("3")], { hasNextPage: false }));

    await expect(utils[loader]("p-1", dispatch)).resolves.toEqual([row("1"), row("2"), row("3")]);
    expect(core.graphqlWithVariables.mock.calls.map(([, variables]) => variables)).toEqual([
      { uuid: "p-1" },
      { uuid: "p-1", after: "c1" },
    ]);
  });

  it(`asks for ${field} of the product in pages of 100 with the ${entity} details`, async () => {
    const dispatch = vi.fn().mockResolvedValue(page([], { hasNextPage: false }));

    await utils[loader]("p-1", dispatch);

    const query = core.graphqlWithVariables.mock.calls[0][0].replace(/\s+/g, " ");
    expect(query).toContain(`product(uuid: $uuid) { ${field} (first: 100, after:$after) { edges { node { id`);
    expect(query).toContain(`${entity} { id uuid name code price`);
    expect(query).toContain("pageInfo { hasNextPage endCursor }");
  });

  it("rejects when the request fails", async () => {
    const failure = { status: 500, statusText: "Internal Server Error" };
    const dispatch = vi.fn().mockResolvedValue({ error: true, payload: failure });

    await expect(utils[loader]("p-1", dispatch)).rejects.toThrow();
    expect(error).toHaveBeenCalledWith(failure);
  });
});
