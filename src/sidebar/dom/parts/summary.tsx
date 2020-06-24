import { groupBy, map, mapValues, sum } from 'lodash'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { getPartsByType, PartType, PartValue } from 'src'
import { Box, Text } from 'theme-ui'

interface PartSummaryProps {}
export function PartSummary(props: PartSummaryProps) {
  const partsByType = useSelector(getPartsByType)

  return (
    <Box as="section" sx={{ padding: 3 }}>
      <Box as="header">
        <Text as="h3" sx={{ fontSize: 3 }}>
          Summary
        </Text>
      </Box>
      <BeamSummary beams={partsByType[PartType.Beam]} />
    </Box>
  )
}

interface BeamSummaryProps {
  beams: Array<PartValue>
}

export function BeamSummary(props: BeamSummaryProps) {
  const { beams } = props
  const numBeams = beams.length
  const totalLength = useMemo(() => {
    return calculateTotalLength(beams)
  }, [beams])
  const numBeamsByLength = useMemo(() => {
    return calculateNumBeamsByLength(beams)
  }, [beams])

  return (
    <Box
      as="dl"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'max-content auto',
        padding: 2,

        dt: {
          padding: 2,
          gridColumnStart: 1,
        },
        dd: {
          padding: 2,
          gridColumnStart: 2,
        },
      }}
    >
      <dt>Total quantity</dt>
      <dd>{numBeams} beams</dd>
      <dt>Total length</dt>
      <dd>{totalLength} holes</dd>
      <dt>Quantity by length</dt>
      <dd>
        <Box
          as="table"
          sx={{
            tr: {
              py: 2,
            },
            th: {
              textAlign: 'center',
              paddingRight: 3,
              fontWeight: 'bold',
            },
            td: {
              textAlign: 'center',
              paddingRight: 3,
              py: 2,
            },
          }}
        >
          <thead>
            <tr>
              <th>Length</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(numBeamsByLength).map(
              ([length, numBeamsOfLength]) => (
                <tr key={length}>
                  <td>{length} holes</td>
                  <td>{numBeamsOfLength}</td>
                </tr>
              ),
            )}
          </tbody>
        </Box>
      </dd>
    </Box>
  )
}

function calculateTotalLength(beams: Array<PartValue>) {
  return sum(map(beams, 'length'))
}

function calculateNumBeamsByLength(beams: Array<PartValue>) {
  return mapValues(groupBy(beams, 'length'), 'length')
}
