const isMac = navigator.platform.match(/^Mac/);

const allModifiers = ['shift', 'alt', 'ctrl', 'meta'];

const getModifierState = (event: any, name: string) => {
  if (name === 'shift') return event.shiftKey;
  if (name === 'alt') return event.altKey;
  if (name === 'ctrl') return event.ctrlKey;
  if (name === 'meta') return event.metaKey;
  if (name === 'accel') return isMac ? event.metaKey : event.ctrlKey;
};

export const matchActionBindings = (event: any, actionBindings: ActionBinding[] | null) => {
  if (!actionBindings) return false;
  return actionBindings.some(ab => matchActionBinding(event, ab));
};

export const matchActionBinding = (event: any, actionBinding: ActionBinding) => {
  const {button, modifiers, wheel} = actionBinding;

  if (wheel && !event.type.match(/^wheel/)) return false;
  if (button && (!event.type.match(/^pointer/) || !event.buttons[button])) return false;
  if (!matchModifiers(event, modifiers)) return false;

  return true;
};

export const matchModifiers = (event: any, modifiers: string[] = []) => {
  const on = modifiers.every(m => getModifierState(event, m));
  const off = allModifiers.every(m => modifiers.includes(m) || !getModifierState(event, m));
  return on && off;
};
