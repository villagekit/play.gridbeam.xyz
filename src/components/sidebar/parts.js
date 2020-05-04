import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Text } from 'theme-ui'
import { groupBy, map, sum } from 'lodash'

import { getPartsByType } from '../../store'
import Codec from '../../codec'

export default Parts

function Parts(props) {
  const partsByType = useSelector(getPartsByType)

  return (
    <PartsContainer>
      <Text as="h2" fontSize={4}>
        Parts
      </Text>
      <BeamSummary beams={partsByType[Codec.PartType.Beam]} />
    </PartsContainer>
  )
}

function PartsContainer(props) {
  return <Box p={3} {...props} />
}

function BeamSummary(props) {
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

function calculateTotalLength(beams) {
  return sum(map(beams, 'length'))
}

function calculateNumBeamsByLength(beams) {
  return map(groupBy(beams, 'length'), 'length')
}
