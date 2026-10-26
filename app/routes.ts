import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('pages/Welcome.jsx'),
  route('introduction', 'pages/Introduction.jsx'),
  route('get-started', 'pages/GetStarted.jsx'),
] satisfies RouteConfig

