import { Generator } from 'graffle/generator'

export default Generator.configure({
  defaultSchemaUrl: true,
  schema: {
    type: 'url',
    url: new URL('https://backboard.railway.com/graphql/v2'),
    headers: {
      Authorization: `Bearer ${process.env['MAGLEV_RAILWAY_API_TOKEN'] ?? process.env['RAILWAY_API_TOKEN'] ?? ''}`,
    },
  },
  name: 'Railway',
  outputDirPath: './app/lib/railway/__generated__',
})
