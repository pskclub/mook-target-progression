import type { IStatus } from '#core/types/lib'
import type { IOption } from '#core/types/common'
import { ArrayHelper } from '#core/utils/ArrayHelper'
import { NumberHelper } from '#core/utils/NumberHelper'
import { StringHelper } from '#core/utils/StringHelper'

export { }

declare global {
  export type { IStatus }

  export type { IOption }

  export { NumberHelper }

  export { StringHelper }

  export { ArrayHelper }
}
