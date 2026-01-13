import axios from "axios";
import { Factory } from "../types/energy";

export const factoryService = {
  async getAllFactories(): Promise<Factory[]> {
    const response = await axios.get("/factory/marker");
    return response.data;
  },
};
