import { aiValue } from '@solomonai/templates/ai-value'
import { basicElementsValue } from '@solomonai/templates/basic-elements-value'
import { basicMarksValue } from '@solomonai/templates/basic-marks-value'
import { basicNodesValue } from '@solomonai/templates/basic-nodes-value'
import { blockMenuValue } from '@solomonai/templates/block-menu-value'
import { calloutValue } from '@solomonai/templates/callout-value'
import { columnValue } from '@solomonai/templates/column-value'
import { commentsValue } from '@solomonai/templates/comments-value'
import { copilotValue } from '@solomonai/templates/copilot-value'
import { dateValue } from '@solomonai/templates/date-value'
import { dndValue } from '@solomonai/templates/dnd-value'
import { emojiValue } from '@solomonai/templates/emoji-value'
import { equationValue } from '@solomonai/templates/equation-value'
import { floatingToolbarValue } from '@solomonai/templates/floating-toolbar-value'
import { horizontalRuleValue } from '@solomonai/templates/horizontal-rule-value'
import { linkValue } from '@solomonai/templates/link-value'
import { mediaToolbarValue } from '@solomonai/templates/media-toolbar-value'
import { mediaValue } from '@solomonai/templates/media-value'
import { mentionValue } from '@solomonai/templates/mention-value'
import { selectionValue } from '@solomonai/templates/selection-value'
import { slashMenuValue } from '@solomonai/templates/slash-menu-value'
import { tableValue } from '@solomonai/templates/table-value'
import { uploadValue } from '@solomonai/templates/upload-value'

const values = {
  'ai-demo': aiValue,
  'basic-elements-demo': basicElementsValue,
  'basic-marks-demo': basicMarksValue,
  'basic-nodes-demo': basicNodesValue,
  'block-menu-demo': blockMenuValue,
  'block-selection-demo': selectionValue,
  'callout-demo': calloutValue,
  'column-demo': columnValue,
  'comments-demo': commentsValue,
  'copilot-demo': copilotValue,
  'date-demo': dateValue,
  'dnd-demo': dndValue,
  'emoji-demo': emojiValue,
  'equation-demo': equationValue,
  'floating-toolbar-demo': floatingToolbarValue,
  // 'font-demo': fontValue,
  'horizontal-rule-demo': horizontalRuleValue,
  'link-demo': linkValue,
  // 'list-demo': listValue,
  'media-demo': mediaValue,
  'media-toolbar-demo': mediaToolbarValue,
  'mention-demo': mentionValue,
  'slash-menu-demo': slashMenuValue,
  'table-demo': tableValue,
  'upload-demo': uploadValue,
}

export const DEMO_VALUES = Object.entries(values).reduce(
  (acc, [key, value]) => {
    const demoKey = key.replace('Value', '-demo')
    acc[demoKey] = value

    return acc
  },
  {} as Record<string, any>,
)
