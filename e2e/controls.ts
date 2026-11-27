import type { Page } from '@playwright/test'

// The swipe rows' dots and arrows are CSS pseudo-elements, which Playwright's locators cannot
// find. Chrome's accessibility tree lists them as assistive technology gets them.

export interface Control {
  name: string
  selected: boolean
  disabled: boolean
  focused: boolean
  nodeId: number
}

async function allControls(page: Page): Promise<Control[]> {
  const session = await page.context().newCDPSession(page)
  const { nodes } = await session.send('Accessibility.getFullAXTree')
  await session.detach()
  return nodes
    .filter((node) => !node.ignored && ['tab', 'button'].includes(String(node.role?.value)))
    .map((node) => {
      const has = (property: string) =>
        node.properties?.some(({ name, value }) => name === property && value.value === true) ??
        false
      return {
        name: String(node.name?.value ?? ''),
        selected: has('selected'),
        disabled: has('disabled'),
        focused: has('focused'),
        nodeId: node.backendDOMNodeId!,
      }
    })
}

export async function controlsNamed(page: Page, name: RegExp): Promise<Control[]> {
  return (await allControls(page)).filter((control) => name.test(control.name))
}

export async function focusedControl(page: Page): Promise<Control | undefined> {
  return (await allControls(page)).find((control) => control.focused)
}

/** Where the control is drawn, relative to the viewport. */
export async function controlBox(
  page: Page,
  control: Control,
): Promise<{ x: number; y: number; width: number; height: number }> {
  const session = await page.context().newCDPSession(page)
  const { model } = await session.send('DOM.getBoxModel', { backendNodeId: control.nodeId })
  await session.detach()
  const [left = 0, top = 0, , , right = 0, bottom = 0] = model.border
  return { x: left, y: top, width: right - left, height: bottom - top }
}

/** A real mouse click on the control with exactly this name. */
export async function clickControl(page: Page, name: string): Promise<void> {
  const control = (await allControls(page)).find((candidate) => candidate.name === name)
  if (control === undefined) {
    throw new Error(`no control named "${name}"`)
  }
  const box = await controlBox(page, control)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}
