import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('pages/Welcome.jsx'),
  route('introduction', 'pages/Introduction.jsx'),
  route('get-started', 'pages/GetStarted.jsx'),
  route('sign-up', 'pages/SignUp.jsx'),
  route('sign-in', 'pages/SignIn.jsx'),
  layout('user/RequireUser.jsx', [
    route('home', 'pages/Home.jsx'),
  ]),
] satisfies RouteConfig

