import type { LC, LiveElement, PropsWithChildren } from '../../live';
import type { UIAggregate } from '../../layout';

import { LayerReconciler } from '../../workbench';
import { Layout } from '../../layout';
import { wrap, gather, unquote } from '../../live';

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
