import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('pages/Welcome.jsx'),
  route('introduction', 'pages/Introduction.jsx'),
  route('get-started', 'pages/GetStarted.jsx'),
  route('sign-up', 'pages/SignUp.jsx'),
  route('sign-in', 'pages/SignIn.jsx'),
  layout('user/RequireUser.jsx', [
    route('home', 'pages/Home.jsx'),
    route('browse-roadmaps', 'pages/BrowseRoadmaps.jsx'),
    route('my-roadmap', 'pages/MyRoadmap.jsx'),
    route('create-roadmap', 'pages/CreateRoadmap.jsx'),
    route('my-roadmap/:roadmapId', 'pages/Roadmap.jsx'),
  ]),
] satisfies RouteConfig

