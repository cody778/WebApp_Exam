import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/Welcome.jsx'),
  route('about', 'routes/About.jsx'),
  route('introduction', 'routes/Introduction.jsx'),
  route('get-started', 'routes/GetStarted.jsx'),
  route('sign-up', 'routes/SignUp.jsx'),
  route('sign-in', 'routes/SignIn.jsx'),
  route('explore', 'routes/Explore.jsx'),
  // Settings and Premium sit outside RequireUser and their own AppLayout. Each page handles signed-out visitors itself.
  route('account', 'routes/Account.jsx'),
  route('appearance', 'routes/Appearance.jsx'),
  route('commissions', 'routes/Commissions.jsx'),
  route('payment-methods', 'routes/PaymentMethods.jsx'),
  route('premium', 'routes/Premium.jsx'),
  layout('routes/AppLayout.jsx', { id: 'public-layout' }, [
    route('path/:roadmapId', 'routes/Roadmap.jsx', { id: 'path-detail' }),
  ]),
  layout('user/RequireUser.jsx', [
    layout('routes/AppLayout.jsx', [
      route('home', 'routes/Home.jsx'),
      route('browse-paths', 'routes/BrowseRoadmaps.jsx'),
      route('my-path', 'routes/MyRoadmap.jsx'),
      route('create-path', 'routes/CreateRoadmap.jsx'),
      route('create-path/youtube', 'routes/YouTubePath.jsx'),
      route('create-path/generate', 'routes/YouTubePath.jsx', { id: 'prompt-generation' }),
      route('my-path/:roadmapId', 'routes/Roadmap.jsx'),
      route('my-path/:roadmapId/lesson/:lessonId', 'routes/Lesson.jsx'),
      route('lesson/:lessonId', 'routes/StandaloneLesson.jsx'),
      route('edit-lesson/:lessonId?', 'routes/EditLesson.jsx'),
      route('browse-lessons', 'routes/BrowseLessons.jsx'),
      route('my-skills', 'routes/MySkills.jsx'),
      route('notifications', 'routes/Notifications.jsx'),
      route('profile/projects', 'routes/BrowseProjects.jsx'),
      route('profile/projects/public', 'routes/PublicProjects.jsx'),
      route('profile/projects/public/:projectId', 'routes/PublicProject.jsx'),
      route('profile/projects/new', 'routes/NewProject.jsx'),
      route('profile/projects/:projectId', 'routes/Project.jsx'),
      route('profile/projects/:projectId/edit', 'routes/EditProject.jsx'),
    ]),
  ]),
  route('*', 'routes/NotFound.jsx'),
] satisfies RouteConfig

