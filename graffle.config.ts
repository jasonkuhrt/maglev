import { Generator } from 'graffle/generator'

export default Generator.configure({
  defaultSchemaUrl: true,
  schema: {
    type: 'url',
    url: new URL('https://backboard.railway.app/graphql/v2'),
  },
  name: 'Railway',
  outputDirPath: './app/lib/railway/__generated__',
  sourceDirPath: './app/lib/railway',
})
