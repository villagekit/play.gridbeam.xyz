/** @jsx jsx */
import Obfuscate from 'react-obfuscate'
import { Flex, jsx, Text } from 'theme-ui'

interface FeedbackProps {}

export function DomSidebarFeedback(props: FeedbackProps) {
  return (
    <Flex sx={{ margin: 2, padding: 3, flexDirection: 'column' }}>
      <FeedbackHeading>Give us feedback!</FeedbackHeading>
      <FeedbackText>Love this app?</FeedbackText>
      <FeedbackText>Found a problem?</FeedbackText>
      <FeedbackText>Missing something?</FeedbackText>
      <FeedbackText>Message us with feedback at:</FeedbackText>
      <FeedbackText>
        <Obfuscate
          email="mikey@villagekit.com"
          headers={{ subject: 'play.gridbeam.xyz feedback' }}
        />
      </FeedbackText>
      <FeedbackText>Tell us what you love about this app.</FeedbackText>
      <FeedbackText>
        Tell us about the problem behavior, and what behavior you expected to
        happen instead.
      </FeedbackText>
      <FeedbackText>Tell us what we should add to this app.</FeedbackText>
      <FeedbackText>
        If at all possible, please include screenshots or screen recordings, to
        help us best understand your situation.
      </FeedbackText>
      <FeedbackText>Cheers!</FeedbackText>
    </Flex>
  )
}

interface FeedbackHeadingProps extends React.ComponentProps<typeof Text> {}

const FeedbackHeading = (props: FeedbackHeadingProps) => (
  <Text sx={{ margin: 2, fontSize: 3, fontFamily: 'heading' }} {...props} />
)

interface FeedbackTextProps extends React.ComponentProps<typeof Text> {}

const FeedbackText = (props: FeedbackTextProps) => (
  <Text sx={{ margin: 2, fontSize: 2, fontFamily: 'body' }} {...props} />
)
