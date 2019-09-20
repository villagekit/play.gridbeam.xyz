exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        three$: require.resolve('./src/vendor/three-exports')
      }
    }
  })
}
