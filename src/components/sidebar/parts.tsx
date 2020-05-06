import { groupBy, map, sum } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Text } from 'theme-ui'

import { getPartsByType, PartType, PartValue } from '../../store'

export default Parts

interface PartsProps {}

function Parts(props: PartsProps) {
  const partsByType = useSelector(getPartsByType)

  return (
    <PartsContainer>
      <Text as="h2" sx={{ fontSize: 4 }}>
        Parts
      </Text>
      <BeamSummary beams={partsByType[PartType.Beam]} />
    </PartsContainer>
  )
}

interface PartsContainerProps extends React.ComponentProps<typeof Box> {}

function PartsContainer(props: PartsContainerProps) {
  return <Box p={3} {...props} />
}

interface BeamSummaryProps {
  beams: Array<PartValue>
}

function BeamSummary(props: BeamSummaryProps) {
  const { beams } = props
  const numBeams = beams.length
  const totalLength = calculateTotalLength(beams)
  const numBeamsByLength = calculateNumBeamsByLength(beams)

  return (
    <Box as="section" sx={{ padding: 3 }}>
      <Box as="header">
        <Text as="h3" sx={{ fontSize: 3 }}>
          Beams
        </Text>
      </Box>
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
    </Box>
  )
}

function calculateTotalLength(beams: Array<PartValue>) {
  return sum(map(beams, 'length'))
}

function calculateNumBeamsByLength(beams: Array<PartValue>) {
  return map(groupBy(beams, 'length'), 'length')
}
