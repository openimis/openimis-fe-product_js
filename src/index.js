import React from "react";

const DEFAULT_CONFIG = {
}

export const ProductModule = (cfg) => {
  return{ ...DEFAULT_CONFIG, ...cfg }; 
}
