import { map } from 'lodash'
import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import {
  getPartsByUuid,
  GlBeam,
  PartType,
  PartValue,
  TexturesByMaterialType,
} from 'src'

interface PartsProps {
  texturesByMaterialType: TexturesByMaterialType
}

export function GlParts(props: PartsProps) {
  const { texturesByMaterialType } = props

  const parts = useSelector(getPartsByUuid)

  return (
    <Fragment>
      {map(parts, (part: PartValue) => {
        const { uuid, materialId } = part

        const partProps = {
          key: uuid,
          part,
          texture: texturesByMaterialType[materialId],
        }

        if (part.type === PartType.Beam) {
          return <GlBeam {...partProps} />
        }
      })}
    </Fragment>
  )
}
