import { useContext, useEffect } from 'react';

import { PageTitleContext } from './pageTitleContext';

/** Nastaví titulek horní lišty na dobu, kdy je obrazovka zobrazená. */
export function usePageTitle(title: string | null): void {
  const setTitle = useContext(PageTitleContext);
  useEffect(() => {
    setTitle?.(title);
    return () => setTitle?.(null);
  }, [setTitle, title]);
}
