import { createContext } from 'react';

/** Detail zákazníka si do horní lišty vkládá jméno zákazníka místo obecného titulku. */
export const PageTitleContext = createContext<((title: string | null) => void) | null>(null);
