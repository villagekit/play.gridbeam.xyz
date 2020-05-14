import React from 'react'
import { AxisDirection, MaterialId, PartType, SizeId, SpecId } from 'src'
import { directionByAxis } from 'src'
import { DomApp, DomHead, withDomLayout } from 'src'

const defaultModel = {
  specId: SpecId.og,
  parts: [
    {
      type: PartType.Beam,
      sizeId: SizeId['1.5in'],
      materialId: MaterialId.Wood,
      origin: {
        x: 0,
        y: 1,
        z: 1,
      },
      direction: directionByAxis[AxisDirection.X],
      length: 4,
    },
    {
      type: PartType.Beam,
      sizeId: SizeId['1.5in'],
      materialId: MaterialId.Wood,
      origin: {
        x: 1,
        y: 0,
        z: 2,
      },
      direction: directionByAxis[AxisDirection.Y],
      length: 6,
    },
    {
      type: PartType.Beam,
      sizeId: SizeId['1.5in'],
      materialId: MaterialId.Wood,
      origin: {
        x: 0,
        y: 0,
        z: 0,
      },
      direction: directionByAxis[AxisDirection.Z],
      length: 10,
    },
  ],
}

function Page() {
  return (
    <>
      <DomHead
        keywords={[
          'grid',
          'beam',
          'modular',
          'open',
          'hardware',
          'construction',
          'furniture',
        ]}
      />
      <DomApp defaultModel={defaultModel} />
    </>
  )
}

export default withDomLayout(Page)
