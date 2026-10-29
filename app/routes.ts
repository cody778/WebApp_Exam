import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/Welcome.jsx'),
  route('introduction', 'routes/Introduction.jsx'),
  route('get-started', 'routes/GetStarted.jsx'),
  route('sign-up', 'routes/SignUp.jsx'),
  route('sign-in', 'routes/SignIn.jsx'),
  route('explore', 'routes/Explore.jsx'),
  route('public-path', 'routes/PublicPath.jsx'),
  route('saved-path', 'routes/SavedPath.jsx'),
  route('sashiko', 'routes/SashikoPath.jsx'),
  route('premium', 'routes/Premium.jsx'),
  layout('user/RequireUser.jsx', [
    layout('routes/AppLayout.jsx', [
      route('home', 'routes/Home.jsx'),
      route('profile', 'routes/Profile.jsx'),
      route('browse-paths', 'routes/BrowseRoadmaps.jsx'),
      route('my-path', 'routes/MyRoadmap.jsx'),
      route('create-path', 'routes/CreateRoadmap.jsx'),
      route('create-path/youtube', 'routes/YouTubePath.jsx'),
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

