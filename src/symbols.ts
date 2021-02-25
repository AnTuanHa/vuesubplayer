import { InjectionKey } from "vue";
import Store from "./interfaces/Store";

export const StoreKey: InjectionKey<Store> = Symbol("Store");
