import type { LC, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { UIAggregate } from '@use-gpu/layout';

import { LayerReconciler } from '@use-gpu/workbench';
import { Layout } from '@use-gpu/layout';
import { wrap, gather, unquote } from '@use-gpu/live';

const {reconcile, quote} = LayerReconciler;

export type CaptureLayoutProps = PropsWithChildren<{
  then: (items: UIAggregate[]) => LiveElement,
}>;

export const CaptureLayout: LC<CaptureLayoutProps> = (props: CaptureLayoutProps) => {
  const {children, then} = props;

  return reconcile(
    quote(
      gather(
        unquote(wrap(Layout, children)),
        then
      )
    )
  );
};
